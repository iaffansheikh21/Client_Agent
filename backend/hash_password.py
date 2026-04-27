import bcrypt

password = input("Enter new password: ")
hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
print(f"\nHash: {hashed}")
