//Middlewares are used between each server action to check

//ADMIN MIDDLEWARE
//wheather the admin is logged in or not
const isAdminLogIn=(req,res,next)=>{
    try {
        if(req.session.adminLoggedIn){
            next()
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
    
}

const isAdminLogout=(req,res,next)=>{
    try {
        if(req.session.adminLoggedIn){
            res.redirect('/admin/adminhome')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}


//USER MIDDLEWARE
//LOGIN AUTHENTICATION
const isLoggedIn=(req,res,next)=>{
    try {
        if(req.session.loggedIn){
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLoggedOut=(req,res,next)=>{
    try {
        if(req.session.loggedIn){
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    isAdminLogIn,
    isAdminLogout,
    isLoggedIn,
    isLoggedOut
}