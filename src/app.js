const express = require("express");
const server = express();
const bodyParser = require("body-parser");
server.use(bodyParser.json());

let model = {
  clients: {},
  reset: () => {
    model.clients = {};
  },
  addAppointment: (name, obj) => {
    obj = {
      ...obj,
      status: "pending",
    };
    if (!model.clients[name]) {
      model.clients[name] = [obj];
    } else {
      model.clients[name].push(obj);
    }
    return obj;
  },
  attend: (name, date) => {
    model.clients[name].map((e) => {
      if (e.date === date) e.status = "attended";
    });
  },
  expire: (name, date) => {
    model.clients[name].map((e) => {
      if (e.date === date) e.status = "expired";
    });
  },
  cancel: (name, date) => {
    model.clients[name].map((e) => {
      if (e.date === date) e.status = "cancelled";
    });
  },
  erase: function (name, dateOrStatus) {
    if (
      dateOrStatus === "attended" ||
      dateOrStatus === "cancelled" ||
      dateOrStatus === "expired"
    ) {
      let filterDelete = [...model.clients[name]];
      model.clients[name] = model.clients[name].filter(
        (d) => d.status !== dateOrStatus
      );
      filterDelete = filterDelete.filter((d) => d.status === dateOrStatus);
      return filterDelete;
    }
    model.clients[name] = model.clients[name].filter(
      (d) => d.date !== dateOrStatus
    );
  },
  getAppointments: (name, status) => {
    if (name && status) {
      let filterStatus = model.clients[name].filter((s) => s.status === status);
      return filterStatus;
    }
    if (name && !status && model.clients[name]) return model.clients[name];
    return model.clients;
  },
  getClients: () => {
    let arr = [];
    for (const key in model.clients) arr.push(key);
    return arr;
  },
};

server.get("/api", (req, res) => {
  return res.json(model.clients);
});

server.post("/api/Appointments", (req, res) => {
  const { client, appointment } = req.body;
  if (!client) {
    return res.status(400).send("the body must have a client property");
  } else if (typeof client !== "string") {
    return res.status(400).send("client must be a string");
  } else {
    
    return res
      .status(200)
      .json(model.addAppointment(client, appointment));
  }
});

server.get("/api/Appointments/:name", (req, res) => {
  const { name } = req.params;
  const { date, options } = req.query;

  if (!model.getClients().includes(name)) {
    return res.status(400).send("the client does not exist");
  }
  for (const key in model.clients[name]) {
    if (key.date !== date)
      return res
        .status(400)
        .send("the client does not have a appointment for that date");
  }
});

server.listen(3000);
module.exports = { model, server };
