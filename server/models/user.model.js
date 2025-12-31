import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
// import { MaxLength } from 'buffer'


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        trim: true,
        MaxLength:[50, 'Name cannot exceed 50 characters'] 
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique:true,
        lowercase:true,
        match:[/^[\W-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"]
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minLength:[8, "Password must be at least 8 characters"],
        select:false
    },
    roles:{
        type: String,
        enum: {
            values:['student','instructor','admin'],
            message:'Please select a valid role'
        },
        deafult: 'student'
    },
    avatar:{
        type:String,
        default:'default-avatar.png'
    },
    bio:{
        type:String,
        MaxLength:[200,'Bio cannot exceed 200 characters']
    },
    enrolledCourses:[{
        course:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        enrolledAt:{
            type:Date,
            deafult:Date.now
        }
    }],
    createdCourses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    resetPasswordToken:String,
    resetPasswordExpire: Date,
    lastActive:{
        type:Date,
        default:Date.now
    }

},{
    timestamps:true,
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});


//hashing the password

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,12)
    next();
})


//compare password
userSchema.methods.comparePassword = async function(enterPassword){

    return await bcrypt.compare(enterPassword,this.password)
}

userSchema.methods.getResetPasswordToken=function(){
    const resetToken =crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken= crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex')
    this.resetPasswordExpire = Date.now() + 10 * 60* 1000 //10 minutes
    return resetToken

}
userSchema.methods.updateLastActive = function(){
    this.lastActive = Date.now()
    return this.lastActive({validateBeforeSave:false})
}

//virtual field for  total enrolled course
userSchema.virtual('totalEnrolledCourses').get(function(){
    return this.enrolledCourses.length
})





export const User = mongoose.model('User',userSchema)