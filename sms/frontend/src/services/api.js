import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Students API ─────────────────────────────────────────────────────────────

export const getStudents = (params = {}) =>
  API.get("/students", { params }).then((r) => r.data);

export const getStudent = (id) =>
  API.get(`/students/${id}`).then((r) => r.data);

export const getStats = () =>
  API.get("/students/stats").then((r) => r.data);

export const createStudent = (data) =>
  API.post("/students", data).then((r) => r.data);

export const updateStudent = (id, data) =>
  API.put(`/students/${id}`, data).then((r) => r.data);

export const deleteStudent = (id) =>
  API.delete(`/students/${id}`).then((r) => r.data);

export default API;
