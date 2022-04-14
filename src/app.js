const express = require("express");
const server = express();
const bodyParser = require("body-parser");

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
  erase: (name, dateOrStatus) => {
    model.clients[name].map((e) => {
      if (e.date === dateOrStatus) model.clients[name].shift(e);
      if (e.status === dateOrStatus) delete e;
    });
  },
  getAppointments: (name, status)=>{ 
    return model.clients[name];
  },
  getClients:()=>{
      let arr = [];
      for (const key in model.clients) arr.push(key);
        return arr;      
  }
};

server.use(bodyParser.json());

server.listen(3000);
module.exports = { model, server };
