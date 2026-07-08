"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Spinner,
  ChartBar,
  Pencil,
  Trash,
  Eye,
  ToggleLeft,
  ToggleRight,
  ClipboardText,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getAllQuestionnaires,
  getQuestionnaireSummary,
  deleteQuestionnaire,
  updateQuestionnaire,
  type Questionnaire,
} from "@/lib/actions/questionnaires";
import Link from "next/link";

export default function AdminQuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  async function loadQuestionnaires() {
    try {
      setLoading(true);
      if (activeTab === "list") {
        const data = await getAllQuestionnaires();
        setQuestionnaires(data);
      } else {
        const data = await getQuestionnaireSummary();
        setQuestionnaires(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questionnaires");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestionnaires();
  }, [activeTab]);

  async function handleToggleActive(id: string, currentStatus: boolean) {
    const res = await updateQuestionnaire(id, { is_active: !currentStatus });
    if (res.error) {
      toast.error("Failed to update status", { description: res.error });
    } else {
      toast.success(`Questionnaire ${!currentStatus ? "activated" : "deactivated"}`);
      loadQuestionnaires();
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all responses.`)) {
      return;
    }

    const res = await deleteQuestionnaire(id);
    if (res.error) {
      toast.error("Failed to delete questionnaire", { description: res.error });
    } else {
      toast.success("Questionnaire deleted successfully");
      loadQuestionnaires();
    }
  }

  const typeColors: Record<string, string> = {
    pre_booking: "bg-blue-100 text-blue-700",
    post_booking: "bg-green-100 text-green-700",
    vehicle_feedback: "bg-purple-100 text-purple-700",
    service_quality: "bg-orange-100 text-orange-700",
    satisfaction: "bg-pink-100 text-pink-700",
    damage_report: "bg-red-100 text-red-700",
    improvement: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardText className="w-8 h-8 text-primary" />
            Questionnaire Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage customer feedback surveys and questionnaires
          </p>
        </div>
        <Link href="/admin/questionnaires/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Questionnaire
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "list"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <ClipboardText className="w-4 h-4 inline mr-2" />
          All Questionnaires
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <ChartBar className="w-4 h-4 inline mr-2" />
          Analytics & Summary
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading questionnaires...</p>
        </div>
      )}

      {/* List View */}
      {!loading && activeTab === "list" && (
        <div className="space-y-4">
          {questionnaires.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
              <ClipboardText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Questionnaires Yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Create your first questionnaire to start collecting customer feedback
              </p>
              <Link href="/admin/questionnaires/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Questionnaire
                </Button>
              </Link>
            </div>
          ) : (
            questionnaires.map((q: Questionnaire) => (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{q.title}</h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          typeColors[q.type] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {q.type.replace("_", " ").toUpperCase()}
                      </span>
                      {q.is_mandatory && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                          MANDATORY
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          q.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {q.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{q.description || "No description"}</p>
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <span>
                        <strong>{q.questions?.length || 0}</strong> Questions
                      </span>
                      <span>Target: {q.target_audience.replace("_", " ")}</span>
                      <span>Created: {new Date(q.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(q.id, q.is_active)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={q.is_active ? "Deactivate" : "Activate"}
                    >
                      {q.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <Link href={`/admin/questionnaires/${q.id}/responses`}>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Responses"
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                    </Link>
                    <Link href={`/admin/questionnaires/${q.id}/edit`}>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-5 h-5 text-gray-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(q.id, q.title)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics View */}
      {!loading && activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionnaires.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
              <ChartBar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-sm text-gray-500">Create questionnaires to view analytics</p>
            </div>
          ) : (
            questionnaires.map((q: any) => (
              <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{q.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{q.type.replace("_", " ")}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Responses:</span>
                    <span className="text-sm font-bold text-gray-900">{q.total_responses || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="text-sm font-bold text-green-600">{q.completed_responses || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate:</span>
                    <span className="text-sm font-bold text-primary">{q.completion_rate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Time:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {q.avg_completion_time ? `${Math.round(q.avg_completion_time / 60)}m` : "N/A"}
                    </span>
                  </div>
                </div>

                <Link href={`/admin/questionnaires/${q.id}/responses`}>
                  <Button variant="outline" className="w-full mt-4 text-xs gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    View Responses
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
