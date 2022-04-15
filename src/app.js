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
    if (name && status) return model.clients[name].filter((s) => s.status === status);
    if (name && !status && model.clients[name]) return model.clients[name];
    return model.clients;
  },
  getClients: () => {
    let arr = [];
    for (let key in model.clients) arr.push(key);
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
    return res.status(200).json(model.addAppointment(client, appointment));
  }
});

server.get("/api/Appointments/clients", (req, res) => {
  return res.status(200).send(model.getClients());
});

server.get("/api/Appointments/:name", (req, res) => {
  const { name } = req.params;
  const { date, option } = req.query;

  if (!model.getClients().includes(name)) return res.status(400).send("the client does not exist");
  const aux = model.getAppointments(name).filter((e) => e.date === date);
  
  if (aux.length === 0) {
    return res
      .status(400)
      .send("the client does not have a appointment for that date");
  }
  if (!["attend", "expire", "cancel"].includes(option)) {
    return res.status(400).send("the option must be attend, expire or cancel");
  }
  switch (option) {
    case "attend":{
      model.attend(name, date);
      return res.status(200).send(model.getAppointments(name).find(e => e.date === date))
    }
    case "expire":{
      model.expire(name, date);
      return res.status(200).send(model.getAppointments(name).find(e => e.date === date))
    }
    case "cancel":{
      model.cancel(name, date);
      return res.status(200).send(model.getAppointments(name).find(e => e.date === date))
    }
  }
  
});

server.get("/api/Appointments/:name/erase", (req, res) => {
  const { name } = req.params;
  const { date } = req.query;
  if (!model.getClients().includes(name)) {
    return res.status(400).send("the client does not exist");
  }
  if (name && date) {
    return res.status(200).json(model.erase(name, date));
  }
});


server.get("/api/Appointments/getAppointments/:name", (req, res) => {
  const { name } = req.params;
  const { status } = req.query;
  res.status(200).send(model.getAppointments(name, status));
});


server.listen(3000);
module.exports = { model, server };
