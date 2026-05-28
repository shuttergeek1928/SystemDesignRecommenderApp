const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('SystemDesignDb');
  const session = await db.collection('DesignHistory').find({ sql_session_id: 'bc3905aa-0b91-444b-b709-f9106d71fd0a' }).toArray();
  console.log(JSON.stringify(session[0].architecture_design, null, 2));
  await client.close();
}
run();
