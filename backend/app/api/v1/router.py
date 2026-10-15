from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, farms, crops, weather, mandi, disease, admin_knowledge, chat, feedback, admin_system, voice

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(farms.router, prefix="/farms", tags=["Farms"])
api_router.include_router(crops.router, prefix="/crops", tags=["Crops"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(mandi.router, prefix="/mandi", tags=["Mandi"])
api_router.include_router(disease.router, prefix="/disease", tags=["Disease Detection"])
api_router.include_router(admin_knowledge.router, prefix="/admin/knowledge", tags=["Admin Knowledge Base"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Advisor RAG Chat"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
api_router.include_router(admin_system.router, prefix="/admin", tags=["Admin System"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Recognition"])



