const userController = require('../controller/userController')
const middlewareController = require('../controller/middlewareController')
var express = require('express');
var router = express.Router();

// Home page load
router.get('/',userController.mainLoad)
router.get('/products',userController.homeLoad)

//Home Page Sort
router.get('/sortproducts',userController.sortProducts)

//products load on category
router.get('/category',userController.categorywiseLoad)
router.get('/productsearch',userController.searchProduct)

//Signup User
router.get('/register',middlewareController.isLoggedIn,userController.registerLoad)
router.post('/register',userController.passwordCheck,userController.insertUser)
router.get('/register/verify',userController.verifyMail)

//Login User
router.get('/login',middlewareController.isLoggedIn,userController.loginLoad)
router.post('/login',userController.verifyLogin)
router.get('/logout',userController.logout)

//User Profile
router.get('/userprofile',middlewareController.isLoggedOut,userController.profileView)
router.post('/profile_edit',middlewareController.isLoggedOut,userController.profileEdit)
router.post('/profileotpverify',middlewareController.isLoggedOut,userController.verifyProfileOtp)
router.post('/profile_address_add',middlewareController.isLoggedOut,userController.ProfileAddAddress)
router.post('/address_edit',middlewareController.isLoggedOut,userController.profileEditAddress)
router.get('/delete-address/',middlewareController.isLoggedOut,userController.profileAddressDelete)

//Otp login
router.get('/otp',middlewareController.isLoggedIn,userController.otpLoginLoad)
router.post('/otp',userController.otpMailVerify)
router.post('/otpverify',userController.checkOtp)

//Forget Password
router.get('/forget',middlewareController.isLoggedIn,userController.forgetLoad)
router.post('/forget',userController.verifyForgetMail)
router.get('/forget/verify',userController.resetPasswordLoad)
router.post('/forget/reset',userController.confirmPasswordCheck,userController.setResetPassword)

//Product load
router.get('/productload',userController.singleProductLoad)

//User Orders
router.get('/orders',middlewareController.isLoggedOut,userController.myOrders)
router.get('/cancelorder/:id',middlewareController.isLoggedOut,userController.orderCancel)
router.post('/return-order',middlewareController.isLoggedOut,userController.returnOrder)

//User Cart
router.get('/cart',middlewareController.isLoggedOut,userController.userCart)
router.post('/addtocart',middlewareController.isLoggedOut,userController.addToCart)
router.get('/cart/delete/:id/:size',userController.deleteCart);
router.post('/cart/checkout',userController.updateCart)

//WishList
router.get('/wishlist',middlewareController.isLoggedOut,userController.wishlistLoad)
router.get('/addwishlist/',userController.addToWishlist)
router.get('/removeWishlist/',userController.removeWishlist)

//Proceed for Payment
router.get('/payment',userController.orderPayment)
router.post('/addaddress',userController.addAddress)
router.post('/confirm_order',userController.confirmOrder)
router.post('/createOrder',userController.createOrder)
router.post('/payment_success',userController.paymentSuccess)
router.get('/ordersuccess',userController.orderSuccess)

module.exports = router;
