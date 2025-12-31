// import mongoose, { mongo } from "mongoose";

// const MAX_RETRIES=3
// const RETRY_INTERVAL = 5000;


// class DatabaseConnection{
//     constructor(){
//         this.retryCount=0
//         this.isConnected = false



//         //configure mongoose setting
//         mongoose.set('strictQuery', true);

//         //events on mongoose
//         mongoose.connection.on('connected',()=>{
//             console.log("MONGODB CONNECTED successfully");
//             this.isConnected=true


//         })


//         mongoose.connection.on('error',()=>{
//             console.log("MONGODB CONNECTION ERROR")
//             this.isConnected= false
            
//         })

//         mongoose.connection.on('disconnected',()=>{
//             console.log("MONGODB DISCONNECTED ")
            
//             this.HandleDisconnection()
            
//         });

//         process.on('SIGTERM',this.handleAppTermination.bind(this))

//     }



//     //connect
//     async connect(){
//         try {
//             if(!process.env.MONGO_URI){
//                 throw new Error("MONGO db URI is not defined in env variable")
//             }
    
//             const connectionOptions = {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//                 maxPoolSize: 10,
//                 serverSelectionTimeOutMS: 5000,
//                 socketTimeoutMS: 45000,
//                 family: 4, //useIPv4
    
//             }
    
    
//             if(process.env.NODE_ENV ===  'development'){
//                 mongoose.set('debug',true)
//             }
    
    
//             await mongoose.connect(process.env.MONGO_URI, connectionOptions);
//             this.retryCount = 0 //reset retry count on success
//         } catch (error) {
//             console.error(error.message)
//             await this.handleConnectionError()
            
//         }





//     }



//     async handleConnectionError(){
//         if(this.retryCount< MAX_RETRIES){
//             this.retryCount++;
//             console.log(`Retrying connection... Attemp ${this.retryCount} of ${MAX_RETRIES}`)

//             await new Promise(resolve =>{
//                 resolve
//             }, RETRY_INTERVAL)
//             return this.connect()

//         }else{
//             console.error(`Failed to connect to MONGODB after ${MAX_RETRIES} attempts`)
//             process.exit(1)
//         }
//     }



//     async HandleDisconnection(){
//         if(!this.isConnected){
//             console.log("Attempting to reconnect to mongodb...")
//             this.connect()
//         }
//     }


//     async handleAppTermination(){
//         try{
//             await mongoose.connection.close()
//             console.log("Mongodb connection closed through app temination")
//             process.exit(0)
//         }catch(error){
//             console.error("Error during database disconnection",error)
//             process.exit(1)
//         }
//     }


//     getConnectionStatus(){
//         return{
//             isConnected: this.isConnected,
//             readyState: mongoose.connection.readyState,
//             host: mongoose.connection.host,
//             name: mongoose.connection.name
//         }
//     }
// }


// //create a singleton instance

// const dbConnection = new DatabaseConnection()


// export default dbConnection.connect.bind(dbConnection)
// export const getDBStatus =  dbConnection.getConnectionStatus.bind(dbConnection)



import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // in ms

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("✅ MONGODB CONNECTED successfully");
      this.isConnected = true;
      this.retryCount = 0;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MONGODB CONNECTION ERROR:", err.message);
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MONGODB DISCONNECTED");
      this.handleDisconnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4,
      });

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      console.log("MongoDB connection attempt successful ✅");
    } catch (err) {
      console.error("MongoDB connection attempt failed ❌:", err.message);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying MongoDB connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts`
      );
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB...");
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error during database disconnection:", err.message);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
