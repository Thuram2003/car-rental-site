"use client";

import { useState, useEffect } from "react";
import {
  ChatCircle,
  CircleNotch,
  Envelope,
  EnvelopeOpen,
  CheckCircle,
  Clock,
  Phone,
  MagnifyingGlass,
  ArrowSquareUpRight,
  User,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getContactMessages, updateContactMessageStatus, type ContactMessage } from "@/lib/actions/contacts";
import { formatCurrency } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "resolved">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
      if (data.length > 0 && !selectedMessage) {
        setSelectedMessage(data[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: "unread" | "read" | "resolved") {
    setUpdatingStatus(true);
    try {
      const res = await updateContactMessageStatus(id, newStatus);
      if (res.success) {
        toast.success(`Message marked as ${newStatus}`);
        
        // Update local state
        setMessages(prev =>
          prev.map(m => (m.id === id ? { ...m, status: newStatus } : m))
        );
        
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        toast.error("Failed to update status", { description: res.error || "" });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating message status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject.toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : msg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === "unread").length,
    resolved: messages.filter(m => m.status === "resolved").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Manage public inquiries, support requests, and feedback</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ChatCircle className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unread Messages</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{stats.unread}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Envelope className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved Messages</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.resolved}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Board */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Messages List & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4 space-y-4">
              {/* Search */}
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                icon={<MagnifyingGlass className="h-4 w-4" />}
                className="w-full h-10 border-gray-200"
              />

              {/* Status Filters */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {(["all", "unread", "read", "resolved"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                      statusFilter === tab
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* List Card */}
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <CircleNotch className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-16 text-gray-400 space-y-2">
                  <Envelope className="w-12 h-12 mx-auto text-gray-200" />
                  <p className="text-sm font-semibold">No messages found</p>
                  <p className="text-xs text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {filteredMessages.map(msg => {
                    const isSelected = selectedMessage?.id === msg.id;
                    return (
                      <button
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`w-full text-left p-4 hover:bg-gray-50/50 transition-all flex items-start gap-3 border-l-4 ${
                          isSelected ? "border-orange-500 bg-orange-50/10" : "border-transparent"
                        }`}
                      >
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-gray-900 text-sm truncate">{msg.name}</p>
                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold text-gray-800 truncate ${msg.status === 'unread' ? 'font-bold text-gray-950' : 'font-medium'}`}>
                            {msg.subject}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {msg.message}
                          </p>
                          <div className="flex items-center gap-1.5 pt-1">
                            <Badge
                              variant={
                                msg.status === "unread"
                                  ? "destructive"
                                  : msg.status === "read"
                                  ? "warning"
                                  : "success"
                              }
                              className="text-[10px] font-semibold tracking-wider uppercase scale-90 origin-left"
                            >
                              {msg.status}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Message Details */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <Card className="border-gray-100 shadow-sm bg-white sticky top-24">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Subject</span>
                    <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 pt-1.5">
                      <Badge
                        variant={
                          selectedMessage.status === "unread"
                            ? "destructive"
                            : selectedMessage.status === "read"
                            ? "warning"
                            : "success"
                        }
                        className="text-xs font-bold tracking-wider uppercase"
                      >
                        {selectedMessage.status}
                      </Badge>
                      <span className="text-xs text-gray-500 font-light flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sender details */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3">
                  <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Sender Information</span>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <User className="w-4 h-4 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium leading-none">Name</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedMessage.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Envelope className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium leading-none">Email Address</p>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="font-semibold text-blue-600 hover:underline mt-1 block truncate"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium leading-none">Phone Number</p>
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="font-semibold text-gray-900 hover:text-orange-500 hover:underline mt-1 block"
                          >
                            {selectedMessage.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Message Content</span>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 min-h-[160px] whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-light shadow-inner">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                  {selectedMessage.status === "unread" && (
                    <Button
                      onClick={() => handleStatusChange(selectedMessage.id, "read")}
                      disabled={updatingStatus}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
                    >
                      <EnvelopeOpen className="w-4 h-4 mr-1.5" />
                      Mark as Read
                    </Button>
                  )}
                  {selectedMessage.status !== "resolved" && (
                    <Button
                      onClick={() => handleStatusChange(selectedMessage.id, "resolved")}
                      disabled={updatingStatus}
                      variant="default"
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Mark as Resolved
                    </Button>
                  )}
                  {selectedMessage.status !== "unread" && (
                    <Button
                      onClick={() => handleStatusChange(selectedMessage.id, "unread")}
                      disabled={updatingStatus}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-orange-500 font-semibold"
                    >
                      <Envelope className="w-4 h-4 mr-1.5" />
                      Mark as Unread
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-100 shadow-sm bg-white p-12 text-center text-gray-400 space-y-3">
              <Envelope className="w-12 h-12 mx-auto text-gray-200" />
              <h3 className="font-bold text-gray-700">Select an inquiry</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Click on any message in the inbox to view full sender information, content details, and manage its status.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
