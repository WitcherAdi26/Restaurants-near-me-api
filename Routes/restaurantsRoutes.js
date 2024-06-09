import express from "express";
import restaurantModel from "../models/restaurantModel.js";

const restoRouter=express.Router();

// restaurants home
restoRouter.get("",(req,res)=>{
    res.send("<h1>Resto</h1>")
});

// Helper function to calculate distance between two points using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x*Math.PI/180;
    }

    const R=6371;
    const dLat=toRad(lat2-lat1);
    const dLon=toRad(lon2-lon1);
    const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R*c*1000;
}

// POST request based on Latitude and longitude with specified radius
restoRouter.post('/nearby', async (req, res) => {
    const {latitude,longitude,radius}=req.body;
    if (!latitude || !longitude || !radius) {
        return res.status(400).json({msg:'All fields are required'});
    }



    const restaurants=await restaurantModel.find();

    const nearbyRestaurants=restaurants.filter(r => {
        const distance=getDistance(latitude,longitude,r.get("address").coord[0],r.get("address").coord[1]);
        return distance<=radius;
    }).sort((a,b)=>{
        const distanceA=getDistance(latitude,longitude,a.get("address").coord[0],a.get("address").coord[1]);
        const distanceB=getDistance(latitude,longitude,b.get("address").coord[0],b.get("address").coord[1]);
        return distanceA-distanceB;
    }).map(r=>({
        restaurant_id: r.get("restaurant_id"),
        name: r.get("name"),
        address: r.get("address"),
        cuisine: r.get("cuisine")        
    }));

    res.status(200).json({"Restaurants near you ":nearbyRestaurants});
});

// Get request based on Latitude and longitude with specified radius range
restoRouter.post('/range', async (req, res) => {
    const {latitude,longitude,minimumDistance,maximumDistance}=req.body;
    if (!latitude || !longitude || !minimumDistance || !maximumDistance) {
        return res.status(400).json({msg:'All fields are required'});
    }

    const restaurants=await restaurantModel.find();

    const rangeRestaurants=restaurants.filter(r=>{
        const distance=getDistance(latitude,longitude,r.get("address").coord[0],r.get("address").coord[1]);
        return distance>=minimumDistance && distance<=maximumDistance;
    }).sort((a,b)=>{
        const distanceA=getDistance(latitude,longitude,a.get("address").coord[0],a.get("address").coord[1]);
        const distanceB=getDistance(latitude,longitude,b.get("address").coord[0],b.get("address").coord[1]);
        return distanceA-distanceB;
    }).map(r => ({
        restaurant_id: r.get("restaurant_id"),
        name: r.get("name"),
        address: r.get("address"),
        cuisine: r.get("cuisine") 
    }));

    res.status(200).json({"Restaurants within specified range ":rangeRestaurants});
});


export default restoRouter;