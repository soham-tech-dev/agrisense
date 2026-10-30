# PlantVillage & Field Photograph Dataset Directory

Place PlantVillage dataset images and local field photographs here for model training and field evaluation:
- `ml/dataset/plant_village/` - PlantVillage train/val crop disease images (directory created ✅)
- `ml/dataset/field_photos/` - Local field photographs from farmers/KVK officers (directory created ✅)

## Getting the Dataset

1. **PlantVillage**: Download from [Kaggle PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) and extract into `plant_village/`.
2. **Field Photos**: Collect real-world leaf photos from farmers or KVK officers and place in `field_photos/`.

## Training
After placing images, run the training pipeline from the project root:
```powershell
Set-Location ml/training
python train_mobilenetv2.py
```
The trained model weights will be saved to `ml/models/mobilenetv2_crop_disease.h5`.
