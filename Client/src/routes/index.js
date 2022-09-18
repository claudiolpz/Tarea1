const { Router }= require('express')
const router=Router()



const { searchpag,Getpags}=require('../controllers/index.controller')


router.post('/pag/search/',searchpag)
// router.get('/Inventary',Getitems)

module.exports=router;