import io
import cv2
import numpy as np
from PIL import Image, ImageOps

class ImageValidationError(Exception):
    def __init__(self, message: str = "Please take a clear photo of the affected leaf.", detail: str = ""):
        self.message = message
        self.detail = detail
        super().__init__(self.message)

class ImageValidationService:
    # Thresholds
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
    MIN_FILE_SIZE_BYTES = 100               # 100 Bytes minimum
    MIN_DIMENSION = 64                      # Minimum height and width in pixels
    MAX_DIMENSION = 6000                    # Maximum dimension safety limit
    LAPLACIAN_BLUR_THRESHOLD = 30.0         # Blurry image threshold (var of Laplacian)
    DARKNESS_THRESHOLD = 25.0               # Mean brightness threshold (0-255 scale)
    ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

    @classmethod
    def validate_image_bytes(cls, image_bytes: bytes, filename: str = "", content_type: str = "") -> np.ndarray:
        """
        Validates an image byte payload against quality, size, corruption, blur, and lighting conditions.
        Returns the decoded OpenCV BGR image matrix if valid.
        Raises ImageValidationError if invalid.
        """
        # 1. Size check
        if not image_bytes or len(image_bytes) < cls.MIN_FILE_SIZE_BYTES:
            raise ImageValidationError(
                message="Please take a clear photo of the affected leaf.",
                detail="File is empty or too small"
            )

        if len(image_bytes) > cls.MAX_FILE_SIZE_BYTES:
            raise ImageValidationError(
                message="Please take a clear photo of the affected leaf.",
                detail=f"File exceeds maximum size of {cls.MAX_FILE_SIZE_BYTES // (1024*1024)}MB"
            )

        # 2. Content-type check if provided
        if content_type and content_type.lower() not in cls.ALLOWED_CONTENT_TYPES:
            # Check extension as fallback
            ext = filename.split('.')[-1].lower() if '.' in filename else ''
            if ext not in {"jpg", "jpeg", "png", "webp"}:
                raise ImageValidationError(
                    message="Please take a clear photo of the affected leaf.",
                    detail=f"Unsupported file type: {content_type}"
                )

        # 3. Corruption & OpenCV Decode check
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None or img.size == 0:
            # Try PIL fallback to verify if corrupted
            try:
                pil_img = Image.open(io.BytesIO(image_bytes))
                pil_img.verify()
                # Re-open after verify()
                pil_img = Image.open(io.BytesIO(image_bytes))
                pil_img = ImageOps.exif_transpose(pil_img)
                img = cv2.cvtColor(np.array(pil_img.convert('RGB')), cv2.COLOR_RGB2BGR)
            except Exception:
                raise ImageValidationError(
                    message="Please take a clear photo of the affected leaf.",
                    detail="Image file is corrupted or unreadable"
                )

        # 4. Dimension check
        height, width = img.shape[:2]
        if height < cls.MIN_DIMENSION or width < cls.MIN_DIMENSION:
            raise ImageValidationError(
                message="Please take a clear photo of the affected leaf.",
                detail=f"Image dimensions ({width}x{height}) are too small (minimum {cls.MIN_DIMENSION}x{cls.MIN_DIMENSION})"
            )

        # 5. Convert to grayscale for quality analysis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 6. Blurry image check (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < cls.LAPLACIAN_BLUR_THRESHOLD:
            raise ImageValidationError(
                message="Please take a clear photo of the affected leaf.",
                detail=f"Image is too blurry (Laplacian variance: {laplacian_var:.2f} < {cls.LAPLACIAN_BLUR_THRESHOLD})"
            )

        # 7. Very dark image check (Mean brightness)
        mean_brightness = float(cv2.mean(gray)[0])
        if mean_brightness < cls.DARKNESS_THRESHOLD:
            raise ImageValidationError(
                message="Please take a clear photo of the affected leaf.",
                detail=f"Image is too dark (Mean brightness: {mean_brightness:.2f} < {cls.DARKNESS_THRESHOLD})"
            )

        return img
