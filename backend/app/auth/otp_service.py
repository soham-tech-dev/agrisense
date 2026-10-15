import logging
from abc import ABC, abstractmethod
from app.core.config import settings

logger = logging.getLogger(__name__)

class OTPServiceBase(ABC):
    @abstractmethod
    def send_otp(self, phone: str) -> bool:
        pass

    @abstractmethod
    def verify_otp(self, phone: str, otp: str) -> bool:
        pass

class DevOTPService(OTPServiceBase):
    """
    Development OTP Service abstraction.
    In development mode or when no SMS provider is configured,
    accepts DEV_OTP_CODE (default: 123456).
    """
    def send_otp(self, phone: str) -> bool:
        logger.info(f"[DEV OTP] Generated OTP for phone {phone}: {settings.DEV_OTP_CODE}")
        print(f"\n==========================================")
        print(f" [DEV OTP SERVICE] OTP for {phone}: {settings.DEV_OTP_CODE}")
        print(f"==========================================\n")
        return True

    def verify_otp(self, phone: str, otp: str) -> bool:
        # Accepts DEV_OTP_CODE (123456) in dev mode
        if otp.strip() == settings.DEV_OTP_CODE:
            return True
        return False

def get_otp_service() -> OTPServiceBase:
    # Pluggable factory for OTP provider abstraction
    return DevOTPService()
