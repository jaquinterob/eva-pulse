import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'dev'
  const hash = await bcrypt.hash(password, 10)
  
  console.log('\n✅ Hash generado para la contraseña "dev":\n')
  console.log(hash)
  console.log('\n📋 Comando para MongoDB Compass:\n')
  console.log(`db.users.insertOne({
  username: "dev",
  password: "${hash}",
  createdAt: new Date(),
  updatedAt: new Date()
})\n`)
  console.log('💡 O usa este script completo:\n')
  console.log(`// Script para MongoDB Compass
use('eva-pulse');

db.users.insertOne({
  username: "dev",
  password: "${hash}",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✅ Usuario 'dev' creado exitosamente");\n`)
}

generateHash()

