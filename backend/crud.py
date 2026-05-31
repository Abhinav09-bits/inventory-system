from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas


# ─── Products ──────────────────────────────────────────────────────────────────

def get_products(db: Session):
    return db.query(models.Product).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate):
    existing = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product with SKU '{product.sku}' already exists")
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    update_data = product.dict(exclude_unset=True)
    if "sku" in update_data:
        existing = db.query(models.Product).filter(
            models.Product.sku == update_data["sku"],
            models.Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"SKU '{update_data['sku']}' already in use")
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True


# ─── Customers ─────────────────────────────────────────────────────────────────

def get_customers(db: Session):
    return db.query(models.Customer).all()

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    existing = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Customer with email '{customer.email}' already exists")
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return False
    db.delete(db_customer)
    db.commit()
    return True


# ─── Orders ────────────────────────────────────────────────────────────────────

def get_orders(db: Session):
    return db.query(models.Order).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def create_order(db: Session, order: schemas.OrderCreate):
    # Validate customer exists
    customer = get_customer(db, order.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate all products exist and have sufficient stock
    order_items_data = []
    total_amount = 0.0

    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        order_items_data.append((product, item.quantity))
        total_amount += product.price * item.quantity

    # Create order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(db_order)
    db.flush()  # get order id before commit

    # Create order items and reduce stock
    for product, qty in order_items_data:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price
        )
        db.add(db_item)
        product.quantity -= qty  # reduce stock

    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return False
    # Restore stock
    for item in db_order.items:
        product = get_product(db, item.product_id)
        if product:
            product.quantity += item.quantity
    db.delete(db_order)
    db.commit()
    return True


# ─── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard_stats(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = db.query(models.Product).filter(models.Product.quantity <= 5).all()
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock
    }
