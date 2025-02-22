const express=require("express")
const cors=require("cors")
require("dotenv").config()
const port=8000
const mongoo=require("mongoose")
const multer=require("multer")
const app=express()
app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } 
});

mongoo.connect(process.env.MONGU).then(()=>console.log("Connected to mongo db🥳")).catch((e)=>console.log("err at connection with mongo db😔"))
const schema=new mongoo.Schema({
    name:String,
    file:String,
    fieldname:String,
    originalname:String,
    mimetype:String,
    size:Number    
})
const model=mongoo.model("file",schema)
app.post("/upload",upload.single("file"),async (req,res)=>{
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    console.log(req.file)
    const data=req.file.buffer.toString("base64")
    const filename=Date.now()+"-"+req.file.originalname
    try{
        const db=await model.insertMany({name:filename,file:data,fieldname:req.file.fieldname,originalname:req.file.originalname,mimetype:req.file.mimetype,size:req.file.size})
        try{
            const senddata=await model.findOne({name:filename})
            if(senddata){
                
                res.status(200).json({
                    message: "File uploaded successfully.",
                    file: {
                      name: senddata.name,
                      originalname: senddata.originalname,
                      mimetype: senddata.mimetype,
                      size: senddata.size,
                    },
                  });
                
            }else{
                res.status(400).json({message:"not found"})
               
            }
        }catch(e){
            console.log(e)

        }
        

    }catch(e){
        console.log(e)
    }
})
app.get("/",(req,res)=>{
    res.send("<h1>Hello world</h1>")
})
app.listen(port , ()=>{
    console.log(`server is running on ${port}....`)
})