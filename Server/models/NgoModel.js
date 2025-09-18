const mongoose = require('mongoose');

const NGOSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            required: true
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: [
                'Human Rights & Civil Liberties',
                'Women’s Rights & Gender Justice',
                'Child Protection',
                'Labor & Employment Rights',
                'Refugee & Migrant Rights',
                'LGBTQ+ Rights'
            ],
            required: true
        },
        logo: {
            type: String,
            default:null
        },
        contact:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        images:{
            type:Array,
            required:true
        },
    },
    { timestamps: true }
);
NGOSchema.statics.topRatings = function(){
    return this.find({rating:{$gt:4}});
}

module.exports = mongoose.model('NGO', NGOSchema);
