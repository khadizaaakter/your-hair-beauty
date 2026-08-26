
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    MessageSquare,
    Mail,
    CheckCircle,
    Reply,
    Inbox,
    MailCheck,
    Archive,
    Eye,
    X,
    Loader2,
    Filter
} from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { NeonButton } from '../../components/ui/NeonButton';

interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'resolved';
    created_at: string;
}

const statusConfig = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Inbox },
    read: { label: 'Read', color: 'bg-slate-100 text-slate-600', icon: Eye },
    replied: { label: 'Replied', color: 'bg-emerald-100 text-emerald-700', icon: Reply },
    resolved: { label: 'Resolved', color: 'bg-purple-100 text-purple-700', icon: Archive },
};

export function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const fetchMessages = async () => {
        try {
            const response = await api.contact.list();
            if (response.success && response.data) {
                setMessages(response.data as any);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            const response = await api.contact.updateStatus(id, newStatus);
            if (response.success) {
                toast.success(`Status updated to ${newStatus}`);
                setMessages(messages.map(msg =>
                    msg.id === id ? { ...msg, status: newStatus as any } : msg
                ));
                if (selectedMessage?.id === id) {
                    setSelectedMessage(prev => prev ? { ...prev, status: newStatus as any } : null);
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    // Stats
    const stats = {
        total: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        replied: messages.filter(m => m.status === 'replied').length,
        resolved: messages.filter(m => m.status === 'resolved').length,
    };

    // Filter
    const filteredMessages = filterStatus === 'all'
        ? messages
        : messages.filter(m => m.status === filterStatus);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Messages | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Messages</h1>
                    <p className="text-slate-500">View and manage contact form submissions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-neon-pink bg-neon-pink/10' },
                        { label: 'New', value: stats.new, icon: Inbox, color: 'text-blue-600 bg-blue-100' },
                        { label: 'Replied', value: stats.replied, icon: MailCheck, color: 'text-emerald-600 bg-emerald-100' },
                        { label: 'Resolved', value: stats.resolved, icon: Archive, color: 'text-purple-600 bg-purple-100' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-card">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                    <p className="text-sm text-slate-600">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400" />
                    {['all', 'new', 'read', 'replied', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === status
                                    ? 'bg-neon-pink text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-neon-pink/50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Messages Table */}
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">From</th>
                                    <th className="px-6 py-4 font-medium">Subject</th>
                                    <th className="px-6 py-4 font-medium">Message</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMessages.map((msg) => {
                                    const config = statusConfig[msg.status] || statusConfig.new;
                                    return (
                                        <motion.tr
                                            key={msg.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${msg.status === 'new' ? 'bg-blue-50/30' : ''
                                                }`}
                                            onClick={() => setSelectedMessage(msg)}
                                        >
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
                                                    <config.icon className="w-3 h-3" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{msg.name}</div>
                                                <div className="text-sm text-slate-500">{msg.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-700 font-medium">{msg.subject}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 line-clamp-2 max-w-md" title={msg.message}>
                                                    {msg.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                {new Date(msg.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {msg.status === 'new' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(msg.id, 'read')}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Mark as Read"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {msg.status !== 'replied' && msg.status !== 'resolved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(msg.id, 'replied')}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Mark as Replied"
                                                        >
                                                            <Reply className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {msg.status !== 'resolved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(msg.id, 'resolved')}
                                                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Mark as Resolved"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <a
                                                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                                        className="p-2 text-slate-400 hover:text-neon-pink hover:bg-pink-50 rounded-lg transition-colors"
                                                        title="Reply via Email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {filteredMessages.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                                                <p className="text-lg font-medium text-slate-900">
                                                    {filterStatus === 'all' ? 'No messages yet' : `No ${filterStatus} messages`}
                                                </p>
                                                <p>Contact form submissions will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMessage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-semibold text-slate-900">Message Detail</h2>
                                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">From</p>
                                        <p className="font-semibold text-slate-900">{selectedMessage.name}</p>
                                        <p className="text-sm text-slate-500">{selectedMessage.email}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${(statusConfig[selectedMessage.status] || statusConfig.new).color}`}>
                                        {(statusConfig[selectedMessage.status] || statusConfig.new).label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Subject</p>
                                    <p className="font-medium text-slate-900">{selectedMessage.subject}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Message</p>
                                    <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Received</p>
                                    <p className="text-slate-700">
                                        {new Date(selectedMessage.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="inline-block"
                                    >
                                        <NeonButton size="sm" variant="primary">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>Reply via Email</span>
                                            </div>
                                        </NeonButton>
                                    </a>
                                    {selectedMessage.status !== 'resolved' && (
                                        <NeonButton
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusUpdate(selectedMessage.id, 'resolved')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Archive className="w-4 h-4" />
                                                <span>Mark Resolved</span>
                                            </div>
                                        </NeonButton>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminMessages;
