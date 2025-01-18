var express = require('express');
var router = express.Router();

const {database} = require('./../config/helpers');

router.get('/', (req, res) => {
    database.table('orders_details as od').join([
        {
            table: 'orders as o',
            on: 'o.id = od.order_id'
        },
        {
            table: 'products as p',
            on: 'p.id = od.product_id'
        },
        {
            table: 'users as u',
            on: 'u.id = o.user_id'
        }
    ])
        .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
        .sort({id: 1})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            } else {
                res.status(500).json({message: 'No orders found'})
            }
        }).catch(err => {
        console.log(err)
        res.status(500).json({message: 'Error in order.', error: err});
    })

})


//Get a single order

router.get('/:id', (req, res) => {
    const orderId = req.params.id;

    database.table('orders_details as od').join([
        {
            table: 'orders as o',
            on: 'o.id = od.order_id'
        },
        {
            table: 'products as p',
            on: 'p.id = od.product_id'
        },
        {
            table: 'users as u',
            on: 'u.id = o.user_id'
        }
    ])
        .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
        .sort({id: 1})
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            } else {
                res.status(500).json({message: `No orders found ${orderId} `})
            }
        }).catch(err => {
        console.log(err)
        res.status(500).json({message: 'Error in order from id.', error: err});
    })
})

router.post('/new', (req, res) => {
    let {userId, products} = req.body;
    console.log(userId, products)

    if (userId !== null && userId > 0 && !isNaN(userId)) {
        database.table('orders')
            .insert({
                user_id: userId,
            }).then(newOrderId => {
            console.log(' ->', newOrderId)
            if (newOrderId.insertId > 0) {
                products.forEach(async (p) => {
                    let data = await database.table('products').filter({
                        id: p.id
                    }).withFields(['quantity']).get()
                    let inCart = p.incart;
                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;
                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }
                    } else {
                        data.quantity = 0;
                    }

                    // insert order details the newly generated order id
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId.insertId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                        database.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(sucessNum => {
                        }).catch(err => console.log(err))
                    }).catch(err => console.log(err))

                })
            } else {
                res.json({message: 'new order failed while adding order detailsss ', success: false})
                return;
            }
            res.json({
                message: `Order successfully placed m¡with order id ${newOrderId.insertId}`,
                success: true,
                order_id: newOrderId.insertId,
                products: products
            })
        }).catch(err => {
            res.status(500).json({message: 'Error in new order.', error: err});

        })
    } else {
        res.status(500).json({message: 'New order filed n'});

    }
})

/* Pasarela de pagos false */

router.post('/payment', (req, res) => {
    setTimeout(()=>{
        res.status(200).json({success: true});
    }, 3000);
})
module.exports = router;
