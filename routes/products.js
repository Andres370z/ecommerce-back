const express = require('express');
const router = express.Router();
const  {database} = require('../config/helpers')
const {filters} = require("pug");



/* GET all Products.
* Maneja una solicitid req y nos devuelve una respuesta res
* */
router.get('/', function(req, res) {
  /* Paginacion */
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;


  /* Calcula el rango de la paginacion */

  let starValue;
  let endValue;

  if (page > 0){
    starValue = (page * limit) - limit;
    endValue = page * limit;
  } else {
    starValue = 0;
    endValue = 10;
  }

  /* Consultas a la base de datos */

  database.table('products as p')
      .join([{
        table: 'categories as c',
        on: 'c.id = p.cat_id'
      }])
      .withFields(['c.title as category',
        'p.title as name',
          'p.price',
          'p.quantity',
          'p.image',
          'p.id'
      ])
      .slice(starValue, endValue)
      .sort({id: .1})
      .getAll()
      .then(products =>{
        if (products.length > 0){
          res.status(200).json({
            count: products.length,
            products: products
          });
        }else {
          res.json({message: 'No products found'});
        }
      }).catch(err => console.log(err))




});

/* Get single product */
router.get('/:productId', (req, res)=>{
  let productsId = req.params.productId;
  console.log(productsId);

  database.table('products as p')
      .join([{
        table: 'categories as c',
        on: 'c.id = p.cat_id'
      }])
      .withFields(['c.title as category',
        'p.title as name',
        'p.price',
        'p.quantity',
        'p.image',
        'p.images',
        'p.id'
      ])
      .filter({'p.id': productsId})
      .sort({id: .1})
      .get()
      .then(product =>{
        if (product){
          res.status(200).json(product);
        }else {
          res.json({message: 'No products found with product id'});
        }
      }).catch(err => console.log(err))
})

/* Get products by categories */
router.get('/category/:catName', (req, res)=>{
  /* Paginacion */
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;


  /* Calcula el rango de la paginacion */

  let starValue;
  let endValue;

  if (page > 0){
    starValue = (page * limit) - limit;
    endValue = page * limit;
  } else {
    starValue = 0;
    endValue = 10;
  }

  /* Consultas a la base de datos */

  const cat_title = req.params.catName;
  database.table('products as p')
      .join([{
        table: 'categories as c',
        on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
      }])
      .withFields(['c.title as category',
        'p.title as name',
        'p.price',
        'p.quantity',
        'p.image',
        'p.id'
      ])
      .slice(starValue, endValue)
      .sort({id: .1})
      .getAll()
      .then(prods =>{
        if (prods.length > 0){
          res.status(200).json({
            count: prods.length,
            products: prods
          });
        }else {
          res.json({message: `No products found from ${cat_title} category`});
        }
      }).catch(err => console.log(err))
})


//Crear un nuevo product0
router.post('/create', (req, res)=>{
  const {title, image, description, price, quantity, short_desc, cat_id} = req.body;

  if (!title || !price || !quantity || !image || !cat_id || !short_desc || !description ){
    return res.status(400).json({message: 'All fields are required'})
  }

  //insertar en base de datos

  database.table('products')
      .insert({
        title: title,
        image: image,
        description: description,
        price: price,
        quantity: quantity,
        short_desc: short_desc,
        cat_id: cat_id
      }).then(productNew =>{
        res.status(200).json({
          message: 'Producto creado con éxito.',
          productId: productNew
        })
  }).catch(err => {
    console.error(req.body);
    res.status(500).json({ message: 'Error al crear el producto.' });
  })
})

//Actualizar un nuevo producto
router.put('/update/:id', (req, res)=>{
    const productsId = req.params.id //captura el id del producto mediante el parametro de la ruta
    const {title, image, description, price, quantity, short_desc, cat_id} = req.body;

    if (!title || !price || !quantity || !image || !cat_id || !short_desc || !description ){
        return res.status(400).json({message: 'All fields are required'})
    }
    database.table('products')
        .filter({id: productsId})
        .update({
            title: title,
            image: image,
            description: description,
            price: price,
            quantity: quantity,
            short_desc: short_desc,
            cat_id: cat_id
        }).then(success => {
            //la libreria retorna un numero que representa la cantidad de filas afectadas eso lo almacena succes
            console.log('este es success ->' , success.changedRows)
            if (success.changedRows > 0){
                res.status(200).json({
                    message: 'Producto actualizado con exito',
                    productsId: productsId
                })
            }else{
                res.status(404).json({ message: `No product found with ID ${productsId}.` });
            }
    }).catch(err =>{
        console.log(err);
        res.status(500).json({ message: 'Error updating the product.', error: err });
    })

})


//Eliminar un producto

router.delete('/delete/:id', (req, res)=>{
    const productId = req.params.id;
    if(!productId){
        return res.status(400).json({message: 'No existe este product'})
    }

    database.table('products')
        .filter({id: productId})
        .remove()
        .then(success => {
            console.log('este es success ->' , success)
            if (success.affectedRows > 0){
                res.status(200).json({
                    message: `el producto ${productId} fue eliminado con exito`,
                    success: true
                })
            }else{
                res.status(404).json({ message: `No product found with ID ${productId}.` });
            }
        }).catch(err => {
            console.log('error', err)
            res.status(500).json({ message: 'Error deleting the product.', error: err });

    })

})


module.exports = router;
