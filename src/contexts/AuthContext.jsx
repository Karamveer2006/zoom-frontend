import {  useNavigate } from "react-router-dom";
import { createContext } from "react";
import axios from 'axios';
import  httpStatus  from "http-status";
import { useContext, useState } from "react";
import server from "../Environment";


  const AuthContext =createContext({});

const client =axios.create({
    baseURL:server.prod+"/api/users"
});


  const AuthProvider =({children})=>{
    const authContext =useContext(AuthContext);

    const [userData ,setUserData]=useState(authContext);

    const handleRegister =async (name,username,password)=>{


        try {
            let request =await client.post("/register",{
                name:name,
                username:username,
                password:password,
            })
            if((await request).status===httpStatus.CREATED){
                return request.data.message;
            }
            
        } catch (error) {
            throw error;
        }

    }

    const handleLogin =async (username ,password)=>{
        try {
            let request =await client.post("/login",{
                username:username,
                password:password,
            
            })
            if((await request).status===httpStatus.OK){
                
                localStorage.setItem("token",request.data.token);
                return request.data.message;
               
            }
            request.data.message
            
        } catch (error) {
            throw error;
        }


    }

    const router=useNavigate();


    const getHistoryOfUser =async()=>{
        try {
            let request =await client.get("/get_all_activities",{
                params:{
                    token:localStorage.getItem("token")
                }
               
            });
            return request.data;

        } catch (error) {
            throw error
            
        }
    }

    const addToUserHistory=async(meetingCode)=>{
        try {
            let request =await client.post("/add_to_activity",{
                token:localStorage.getItem("token"),
                meeting_code:meetingCode
            })
            return request;
        } catch (error) {
throw error
            
        }
    }

    const data ={
        userData ,setUserData,handleRegister,handleLogin,router,getHistoryOfUser,addToUserHistory
    }
 return(
    <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>
 )
}

export  {AuthProvider,AuthContext};