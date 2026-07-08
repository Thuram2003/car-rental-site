"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ClipboardText,
  Spinner,
  ArrowLeft,
  CheckCircle,
  Star,
  RadioButton,
  TextAlignLeft,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getQuestionnaireById,
  submitQuestionnaireResponse,
  type Questionnaire,
  type Question,
  type QuestionnaireResponse,
} from "@/lib/actions/questionnaires";
import Link from "next/link";

export default function QuestionnaireResponsePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.id as string;

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  async function loadQuestionnaire() {
    try {
      setLoading(true);
      const data = await getQuestionnaireById(questionnaireId);
      if (!data) {
        toast.error("Questionnaire not found");
        router.push("/questionnaires");
        return;
      }
      setQuestionnaire(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questionnaire");
    } finally {
      setLoading(false);
    }
  }

  function handleResponse(questionId: string, answer: any) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!questionnaire) return;

    // Validate required questions
    const requiredQuestions = questionnaire.questions.filter((q) => q.required);
    const missingResponses = requiredQuestions.filter((q) => !responses[q.id] && responses[q.id] !== 0);

    if (missingResponses.length > 0) {
      toast.error("Please answer all required questions");
      return;
    }

    try {
      setSubmitting(true);

      const formattedResponses: QuestionnaireResponse[] = Object.entries(responses).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const res = await submitQuestionnaireResponse({
        questionnaireId,
        responses: formattedResponses,
        timeTakenSeconds: timeTaken,
      });

      if (res.error) {
        toast.error("Failed to submit responses", { description: res.error });
      } else {
        toast.success("Thank you for your feedback!", {
          description: "Your responses have been recorded successfully.",
        });
        router.push("/questionnaires");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-gray-500">Loading questionnaire...</p>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Questionnaire not found</p>
        <Link href="/questionnaires">
          <Button className="mt-4">Back to Questionnaires</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <Link href="/questionnaires">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Questionnaires
          </button>
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-lighter flex items-center justify-center shrink-0">
              <ClipboardText className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{questionnaire.title}</h1>
              <p className="text-sm text-gray-600 mb-3">{questionnaire.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{questionnaire.questions.length} Questions</span>
                <span>•</span>
                <span>Est. {Math.ceil(questionnaire.questions.length * 0.5)} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {questionnaire.questions.map((question: Question, index: number) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-lighter text-primary text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
              </div>
            </div>

            {/* Question Type: Text */}
            {question.type === "text" && (
              <Input
                placeholder="Your answer"
                value={responses[question.id] || ""}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                required={question.required}
                icon={<TextAlignLeft size={18} />}
              />
            )}

            {/* Question Type: Textarea */}
            {question.type === "textarea" && (
              <textarea
                placeholder="Your detailed response..."
                value={responses[question.id] || ""}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                required={question.required}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            )}

            {/* Question Type: Multiple Choice */}
            {question.type === "multiple_choice" && (
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses[question.id] === option
                        ? "border-primary bg-primary-lighter"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={(e) => handleResponse(question.id, e.target.value)}
                      required={question.required}
                      className="w-4 h-4 text-primary"
                    />
                    <RadioButton
                      className={`w-5 h-5 ${responses[question.id] === option ? "text-primary" : "text-gray-400"}`}
                    />
                    <span className="text-sm text-gray-900 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Question Type: Rating */}
            {question.type === "rating" && (
              <div className="flex items-center gap-2">
                {Array.from({ length: question.max_rating || 5 }, (_, i) => i + 1).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleResponse(question.id, rating)}
                    className={`p-2 rounded-lg transition-all ${
                      responses[question.id] >= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    <Star
                      className="w-8 h-8"
                      weight={responses[question.id] >= rating ? "fill" : "regular"}
                    />
                  </button>
                ))}
                {responses[question.id] && (
                  <span className="ml-3 text-sm font-bold text-gray-900">
                    {responses[question.id]} / {question.max_rating || 5}
                  </span>
                )}
              </div>
            )}

            {/* Question Type: Yes/No */}
            {question.type === "yes_no" && (
              <div className="flex gap-4">
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    responses[question.id] === "Yes"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value="Yes"
                    checked={responses[question.id] === "Yes"}
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    required={question.required}
                    className="hidden"
                  />
                  <CheckCircle
                    className={`w-5 h-5 ${responses[question.id] === "Yes" ? "text-green-600" : "text-gray-400"}`}
                    weight={responses[question.id] === "Yes" ? "fill" : "regular"}
                  />
                  <span className="text-sm font-bold">Yes</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    responses[question.id] === "No"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value="No"
                    checked={responses[question.id] === "No"}
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    required={question.required}
                    className="hidden"
                  />
                  <CheckCircle
                    className={`w-5 h-5 ${responses[question.id] === "No" ? "text-red-600" : "text-gray-400"}`}
                    weight={responses[question.id] === "No" ? "fill" : "regular"}
                  />
                  <span className="text-sm font-bold">No</span>
                </label>
              </div>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Link href="/questionnaires">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} className="min-w-[160px] gap-2">
            {submitting ? (
              <>
                <Spinner className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Responses
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
