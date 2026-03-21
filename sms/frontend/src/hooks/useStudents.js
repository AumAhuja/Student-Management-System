import { useState, useEffect, useCallback } from "react";
import {
  getStudents,
  getStats,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/api";

export function useStudents(filters) {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudents(filters);
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return { students, pagination, loading, error, refetch: fetchStudents };
}

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats();
      setStats(res.data);
    } catch {
      // silently fail for stats
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export function useStudentMutations(onSuccess) {
  const [saving, setSaving] = useState(false);
  const [apiErrors, setApiErrors] = useState([]);

  const clearErrors = () => setApiErrors([]);

  const add = async (data) => {
    setSaving(true);
    setApiErrors([]);
    try {
      await createStudent(data);
      onSuccess("Student added successfully!", "success");
      return true;
    } catch (err) {
      const e = err.response?.data;
      setApiErrors(e?.errors || [{ message: e?.message || "Failed to add student" }]);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id, data) => {
    setSaving(true);
    setApiErrors([]);
    try {
      await updateStudent(id, data);
      onSuccess("Student updated successfully!", "success");
      return true;
    } catch (err) {
      const e = err.response?.data;
      setApiErrors(e?.errors || [{ message: e?.message || "Failed to update student" }]);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteStudent(id);
      onSuccess("Student deleted.", "error");
      return true;
    } catch (err) {
      onSuccess(err.response?.data?.message || "Failed to delete student", "error");
      return false;
    }
  };

  return { add, update, remove, saving, apiErrors, clearErrors };
}
