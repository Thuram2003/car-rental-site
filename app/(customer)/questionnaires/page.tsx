"use client";

import { useState, useEffect } from "react";
import { ClipboardText, Spinner, CheckCircle, ArrowRight, CalendarBlank, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAvailableQuestionnaires, type Questionnaire } from "@/lib/actions/questionnaires";
import Link from "next/link";

export default function CustomerQuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  async function loadQuestionnaires() {
    try {
      setLoading(true);
      const data = await getAvailableQuestionnaires();
      setQuestionnaires(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questionnaires");
    } finally {
      setLoading(false);
    }
  }

  const typeIcons: Record<string, any> = {
    pre_booking: CalendarBlank,
    post_booking: CheckCircle,
    vehicle_feedback: Star,
    service_quality: Star,
    satisfaction: Star,
    damage_report: ClipboardText,
    improvement: ClipboardText,
  };

  const typeColors: Record<string, string> = {
    pre_booking: "bg-blue-50 border-blue-200",
    post_booking: "bg-green-50 border-green-200",
    vehicle_feedback: "bg-purple-50 border-purple-200",
    service_quality: "bg-orange-50 border-orange-200",
    satisfaction: "bg-pink-50 border-pink-200",
    damage_report: "bg-red-50 border-red-200",
    improvement: "bg-teal-50 border-teal-200",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <ClipboardText className="w-8 h-8 text-primary" />
          Your Feedback Questionnaires
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Help us improve our services by sharing your valuable feedback
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading questionnaires...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && questionnaires.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-sm text-gray-500">
            You've completed all available questionnaires. Thank you for your feedback!
          </p>
        </div>
      )}

      {/* Questionnaires Grid */}
      {!loading && questionnaires.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questionnaires.map((q) => {
            const Icon = typeIcons[q.type] || ClipboardText;
            const colorClass = typeColors[q.type] || "bg-gray-50 border-gray-200";

            return (
              <div
                key={q.id}
                className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${colorClass}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{q.title}</h3>
                      {q.is_mandatory && (
                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 mt-1">
                          MANDATORY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {q.description || "Share your thoughts and help us improve"}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <ClipboardText className="w-3.5 h-3.5" />
                    {q.questions?.length || 0} Questions
                  </span>
                  <span>
                    Est. {Math.ceil((q.questions?.length || 0) * 0.5)} min
                  </span>
                </div>

                <Link href={`/questionnaires/${q.id}`} className="block">
                  <Button className="w-full gap-2 group">
                    Start Questionnaire
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      {!loading && questionnaires.length > 0 && (
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Why Your Feedback Matters
          </h4>
          <p className="text-xs text-blue-700">
            Your responses help us understand your experience better and continuously improve our car rental services.
            All feedback is anonymous and will be used to enhance the quality of service we provide to you and future
            customers.
          </p>
        </div>
      )}
    </div>
  );
}
