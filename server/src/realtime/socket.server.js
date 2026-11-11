import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";

let io;

export const initializeSocket = (httpServer, corsOptions) => {
  io = new Server(httpServer, {
    cors: corsOptions,
    maxHttpBufferSize: 1e6,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string" || !token) {
        return next(new Error("Authentication required"));
      }

      let decoded;
      let role;
      for (const [candidateRole, secret] of [
        ["customer", process.env.CUSTOMER_JWT_SECRET],
        ["admin", process.env.ADMIN_JWT_SECRET],
      ]) {
        if (!secret) continue;
        try {
          decoded = jwt.verify(token, secret);
          role = candidateRole;
          break;
        } catch (error) {
          if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
            throw error;
          }
        }
      }

      if (!decoded?.userID || !mongoose.Types.ObjectId.isValid(decoded.userID)) {
        return next(new Error("Invalid authentication token"));
      }

      const user = await User.findById(decoded.userID).select("_id role isActive");
      if (!user || user.role !== role || !user.isActive) {
        return next(new Error("Account is not authorized"));
      }

      socket.data.userId = user._id.toString();
      socket.data.role = user.role;
      return next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.data.role === "admin") {
      socket.join("admins");
    } else {
      socket.join(`customer:${socket.data.userId}`);
    }
  });

  return io;
};

const getSocketServer = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};

export const emitToAdmins = (event, payload) => {
  getSocketServer().to("admins").emit(event, payload);
};

export const emitToCustomer = (userId, event, payload) => {
  getSocketServer()
    .to(`customer:${userId.toString()}`)
    .emit(event, payload);
};
