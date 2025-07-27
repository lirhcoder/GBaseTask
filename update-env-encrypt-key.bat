@echo off
chcp 65001 >nul
echo =====================================
echo   Update Lark Encrypt Key
echo =====================================
echo.
echo Please add these lines to your .env file:
echo.
echo # Lark Encryption Keys
echo LARK_ENCRYPT_KEY=sJoVjUwk11X2RHNbnOUqpb
echo LARK_VERIFICATION_TOKEN=kititgrCMZ7ZXhI2wyO59fnBavJg6MMI
echo.
echo # OAuth Redirect URI (Cloudflare)
echo LARK_OAUTH_REDIRECT_URI=https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
echo.
echo =====================================
echo   Next Steps:
echo =====================================
echo.
echo 1. Open .env file in your editor
echo 2. Add the above lines
echo 3. Save the file
echo 4. Restart the service (Ctrl+C then npm start)
echo 5. Try saving the OAuth callback URL in Lark platform again
echo.
echo The encryption should now work correctly!
echo.
pause