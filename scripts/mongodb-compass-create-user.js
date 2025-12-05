// Script para copiar y pegar en MongoDB Compass
// Conecta a la base de datos eva-pulse y ejecuta este script completo

use('eva-pulse');

// Verificar si el usuario ya existe
const existingUser = db.users.findOne({ username: "dev" });

if (existingUser) {
  print("⚠️  El usuario 'dev' ya existe");
  print("ID: " + existingUser._id);
} else {
  // Crear el usuario dev
  const result = db.users.insertOne({
    username: "dev",
    password: "$2b$10$.oX9LAqm4l2VFMNYQrAjYOpHo3NSENJoKShJzvi8O7G.O6EQiLXR6",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print("✅ Usuario 'dev' creado exitosamente");
  print("ID: " + result.insertedId);
}

// Verificar el usuario creado
print("\n📋 Usuario en la base de datos:");
const user = db.users.findOne({ username: "dev" });
printjson(user);

