"use client";

import { useState } from "react";
import { createContractorLead } from "../actions";
import { useRouter } from "next/navigation";

export default function ContractorLeadForm({ contractorId }: { contractorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    project_description: "",
    project_address: "",
    project_city: "",
    project_state: "TX",
    project_zip: "",
    budget_range: "",
    preferred_contact_method: "either",
    contact_phone: "",
    contact_email: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createContractorLead(contractorId, formData);
      setSuccess(true);
      // Reset form
      setFormData({
        project_description: "",
        project_address: "",
        project_city: "",
        project_state: "TX",
        project_zip: "",
        budget_range: "",
        preferred_contact_method: "either",
        contact_phone: "",
        contact_email: "",
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit lead");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <p className="font-medium">Lead submitted successfully!</p>
        <p className="mt-1">The contractor will be notified and should contact you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="project_description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="project_description"
          rows={4}
          value={formData.project_description}
          onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
          required
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          placeholder="Describe your project needs..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="project_city" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            City
          </label>
          <input
            id="project_city"
            type="text"
            value={formData.project_city}
            onChange={(e) => setFormData({ ...formData, project_city: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            placeholder="City"
          />
        </div>
        <div>
          <label htmlFor="project_state" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            State
          </label>
          <input
            id="project_state"
            type="text"
            value={formData.project_state}
            onChange={(e) => setFormData({ ...formData, project_state: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            placeholder="TX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget_range" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Budget Range
        </label>
        <input
          id="budget_range"
          type="text"
          value={formData.budget_range}
          onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          placeholder="e.g., $5,000 - $10,000"
        />
      </div>

      <div>
        <label htmlFor="preferred_contact_method" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Preferred Contact Method
        </label>
        <select
          id="preferred_contact_method"
          value={formData.preferred_contact_method}
          onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="either">Either</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact_email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your Email
        </label>
        <input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="contact_phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your Phone
        </label>
        <input
          id="contact_phone"
          type="tel"
          value={formData.contact_phone}
          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          placeholder="(555) 123-4567"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.project_description.trim()}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        {loading ? "Submitting..." : "Submit Lead"}
      </button>
    </form>
  );
}

