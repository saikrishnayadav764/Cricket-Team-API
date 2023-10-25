const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.use(express.json());

const converter = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

app.get("/players/", async (request, response) => {
  const Query = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  let playersArray = await db.all(Query);
  let result = playersArray.map((obj) => converter(obj));
  response.send(result);
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  let query = `INSERT INTO cricket_team(player_name, jersey_number, role) 
    VALUES('${playerName}', ${jerseyNumber}, '${role}')`;
  await db.run(query);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  let query = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  let result = await db.get(query);
  response.send(converter(result));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  let query = `UPDATE cricket_team SET player_name='${playerName}', jersey_number=${jerseyNumber}, role='${role}'
   WHERE player_id = ${playerId}`;
  await db.run(query);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  let query = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(query);
  response.send("Player Removed");
});

module.exports = app;
