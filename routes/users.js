const userController = require('../controller/userController')
var express = require('express');
var router = express.Router();

// Home page load
router.get('/',userController.homeLoad)

//Home Page Sort
router.get('/sortproducts',userController.sortProducts)

//products load on category
router.get('/products/:category',userController.categorywiseLoad)
router.get('/productsearch',userController.searchProduct)

//Signup User
router.get('/register',userController.isLoggedIn,userController.registerLoad)
router.post('/register',userController.passwordCheck,userController.insertUser)
router.get('/register/verify',userController.verifyMail)

//Login User
router.get('/login',userController.isLoggedIn,userController.loginLoad)
router.post('/login',userController.verifyLogin)
router.get('/logout',userController.logout)

//User Profile
router.get('/userprofile',userController.isLoggedOut,userController.profileView)
router.post('/profile_edit',userController.isLoggedOut,userController.profileEdit)
router.post('/profileotpverify',userController.isLoggedOut,userController.verifyProfileOtp)
router.post('/profile_address_add',userController.isLoggedOut,userController.ProfileAddAddress)
router.get('/delete-address/',userController.isLoggedOut,userController.profileAddressDelete)

//Otp login
router.get('/otp',userController.isLoggedIn,userController.otpLoginLoad)
router.post('/otp',userController.otpMailVerify)
router.post('/otpverify',userController.checkOtp)

//Forget Password
router.get('/forget',userController.isLoggedIn,userController.forgetLoad)
router.post('/forget',userController.verifyForgetMail)
router.get('/forget/verify',userController.resetPasswordLoad)
router.post('/forget/reset',userController.confirmPasswordCheck,userController.setResetPassword)

//Product load
router.get('/productload',userController.singleProductLoad)

//User Orders
router.get('/orders',userController.isLoggedOut,userController.myOrders)
router.get('/cancelorder/:id',userController.isLoggedOut,userController.orderCancel)
router.post('/return-order',userController.isLoggedOut,userController.returnOrder)

//User Cart
router.get('/cart',userController.isLoggedOut,userController.userCart)
router.post('/addtocart',userController.isLoggedOut,userController.addToCart)
router.get('/cart/delete/:id/:size',userController.deleteCart);
router.post('/cart/checkout',userController.updateCart)

//Proceed for Payment
router.get('/payment',userController.orderPayment)
router.post('/addaddress',userController.addAddress)
router.post('/confirm_order',userController.confirmOrder)
router.post('/createOrder',userController.createOrder)
router.post('/payment_success',userController.paymentSuccess)
router.get('/ordersuccess',userController.orderSuccess)

module.exports = router;
