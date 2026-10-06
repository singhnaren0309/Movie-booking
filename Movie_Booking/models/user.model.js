const mongoose=require("mongoose")
const bcrypt=require("bcrypt");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Please fill a valid email"],
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    userRole:{
        type:String,
        required:true,
        default:"CUSTOMER",
    },
    userStatus:{
        type:String,
        required:true,
        default:"APPROVED",
    }
}, {timestamps:true})

/**
 * we can setup a hook on userschema such that before we save any use document a hook  should get triggered
 * 1.it should check if the email id has already been used or not ,we do this by searching the email in the database and checking if it is already used or not,and if it is used then we throw an error message.
 * 
 * 2.the next thing is that we have to use hashing and salting for the password before storing it in the database.
 *    we have to use a package called bcryptjs for this 
 */

userSchema.pre('save',async function(){
    //a trigger to encrypt the plain password
    const hash=await bcrypt.hash(this.password,10);
    this.password=hash;
})
/**
 * this is goint to be an instance method for user
 * a trigger which can compare the plain password with the hashed password
 */

userSchema.methods.isValidPassword=async function(plainPassword){
    const currentUser=this; //this refers to the user document who is trying to login
    const compare=await bcrypt.compare(plainPassword,currentUser.password);
    return compare;
}
module.exports=mongoose.model("User",userSchema)