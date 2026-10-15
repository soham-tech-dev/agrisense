import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.models.user import User
from app.models.disease import DiseaseCatalog
from app.core.security import get_password_hash
from app.seed_knowledge import seed_knowledge_base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agrisense_init_db")

def init_database():
    """
    Ensures all database tables and indexes exist from a clean installation.
    Seeds default disease catalog entries, demo farmer user, admin user, and RAG knowledge base.
    """
    logger.info("Initializing AgriSense database tables...")
    Base.metadata.create_all(bind=engine)

    # Schema sync migrations for backwards compatibility
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'FARMER'"))
            conn.commit()
    except Exception:
        pass

    db: Session = SessionLocal()
    try:
        # 1. Seed Demo Farmer User
        farmer = db.query(User).filter(User.phone == "9876543210").first()
        if not farmer:
            farmer = User(
                phone="9876543210",
                name="Ramesh Patil",
                language="mr",
                role="FARMER",
                district="Pune",
                taluka="Haveli",
                village="Shivane"
            )
            db.add(farmer)
            logger.info("Seeded demo farmer user (Phone: 9876543210)")

        # 2. Seed Admin User
        admin = db.query(User).filter(User.phone == "9999999999").first()
        if not admin:
            admin = User(
                phone="9999999999",
                name="AgriSense Admin",
                language="en",
                role="ADMIN",
                district="Pune"
            )
            db.add(admin)
            logger.info("Seeded admin user (Phone: 9999999999)")


        # 3. Seed Disease Catalog
        default_diseases = [
            {
                "id": "tomato_early_blight",
                "crop": "Tomato",
                "name_en": "Tomato Early Blight",
                "name_mr": "टोमॅटो तांबेरा / अगापि करपा (Early Blight)",
                "symptoms_mr": "जुन्या पानांवर गोलाकार तपकिरी ठिपके पडतात. ठिपक्यांच्या भोवती पिवळसर कडे (halo) दिसते.",
                "symptoms_en": "Dark brown concentric target-board spots on older leaves with yellow halos.",
                "advisory_mr": "१. मॅन्कोझेब (Mancozeb 75% WP) २.५ ग्रॅम प्रति लिटर पाणी फवारावे.\n२. कॉपर ऑक्सिक्लोराईड ३ ग्रॅम/लिटर.",
                "advisory_en": "1. Spray Mancozeb 75% WP @ 2.5g/L water.\n2. Apply Copper Oxychloride 50% WP @ 3g/L water.",
                "prevention_mr": "शेतात पाणी साचू देऊ नये. टोमॅटो पिकाची फेरपालट करावी.",
                "prevention_en": "Ensure proper field drainage and practice crop rotation.",
                "source": "KVK Agricultural Bulletin",
                "active": True
            },
            {
                "id": "tomato_late_blight",
                "crop": "Tomato",
                "name_en": "Tomato Late Blight",
                "name_mr": "टोमॅटो उशिरा येणारा करपा (Late Blight)",
                "symptoms_mr": "पानांच्या कडांवर पाणी साचल्यासारखे काळे ठिपके पडतात. दमट हवेत पानांच्या खालच्या बाजूला पांढरी बुरशी दिसते.",
                "symptoms_en": "Large water-soaked dark spots on leaf tips/edges with white fungal bloom underneath in humid weather.",
                "advisory_mr": "१. मेटलॅक्सिल + मॅन्कोझेब (Ridomil Gold) २ ग्रॅम/लिटर फवारणी करावी.\n२. बाधित पिके तातडीने नष्ट करा.",
                "advisory_en": "1. Spray Metalaxyl + Mancozeb (Ridomil Gold) @ 2g/L water.\n2. Promptly remove and bury infected foliage.",
                "prevention_mr": "पावसाळी हवेत स्टिकरचा वापर करून बुरशीनाशकाची प्रतिबंधात्मक फवारणी करावी.",
                "prevention_en": "Apply protective fungicides with sticker agent before continuous rainfall.",
                "source": "ICAR Technical Monograph",
                "active": True
            },
            {
                "id": "cotton_bacterial_blight",
                "crop": "Cotton",
                "name_en": "Cotton Bacterial Blight / Angular Leaf Spot",
                "name_mr": "कापूस जिवाणूजन्य करपा / कोनीय ठिपके (Bacterial Blight)",
                "symptoms_mr": "पानांवर कोनीय (angular) काळे किंवा गडद तपकिरी ठिपके दिसतात. बोन्डांवरही काळे चट्टे पडतात.",
                "symptoms_en": "Water-soaked angular dark brown lesions on leaves bounded by leaf veins; dark lesions on bolls.",
                "advisory_mr": "१. स्ट्रिप्टोसायक्लीन ०.१ ग्रॅम + कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करावी.",
                "advisory_en": "1. Spray Streptocycline @ 0.1g/L + Copper Oxychloride @ 2.5g/L water.",
                "prevention_mr": "बियाणे प्रक्रिया करूनच पेरणी करावी.",
                "prevention_en": "Perform seed treatment with Streptocycline before sowing.",
                "source": "CICR Nagpur Advisory",
                "active": True
            }
        ]

        for d in default_diseases:
            existing_d = db.query(DiseaseCatalog).filter(DiseaseCatalog.id == d["id"]).first()
            if not existing_d:
                cat_entry = DiseaseCatalog(**d)
                db.add(cat_entry)
                logger.info(f"Seeded disease catalog entry: {d['name_en']}")


        db.commit()
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()

    # 4. Seed RAG Knowledge Base
    try:
        seed_knowledge_base()
        logger.info("Knowledge base vector store seeded successfully.")
    except Exception as e:
        logger.warning(f"RAG Knowledge Base seed warning: {e}")

if __name__ == "__main__":
    init_database()
