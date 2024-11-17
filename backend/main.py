import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import io
import requests
import json

app = FastAPI()

cred = credentials.Certificate("./Firebase_db_auth/foodsnap-f642c-firebase-adminsdk-8af48-bd0617d3d4.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def access_nutritional_information(foodCounts: dict):

    result = []

    for food, quantity in foodCounts.items():
        # Query Firestore for the food item
        query = db.collection("food").where("Food", "==", food).limit(1)
        docs = query.stream()

        doc_found = False
        for doc in docs:
            doc_found = True
            nutrition_data = doc.to_dict()
            nutrition_data["Quantity"] = quantity
            nutrition_data["Calories"] *= quantity
            nutrition_data["Carbohydrate"] *= quantity
            nutrition_data["Fat"] *= quantity
            nutrition_data["Fiber"] *= quantity
            nutrition_data["Protein"] *= quantity
            result.append(nutrition_data)

        if not doc_found:
            print(f"No nutritional information found for {food}")

    return result

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:

        response = None

        contents = await file.read()
        
        with open("temp.jpg", "wb") as f:
            f.write(contents)

        url = "http://127.0.0.1:5000/detect"

        with open("temp.jpg", "rb") as img:
            files = {"image": img}
            response = requests.post(url, files=files)

        food_count = response.json()["output"]

        nutrition_info = access_nutritional_information(food_count)

        return JSONResponse(nutrition_info)

    except Exception as e:

        return JSONResponse({"error": str(e)}, status_code=500)