"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import BookingLayout from "@/components/BookingLayout";
import { Gender } from "@/lib/types";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, MapPin, Calendar, Clock, MessageSquare } from "lucide-react";

export default function DetailsPage() {
    const router = useRouter();
    const { formData, updateFormData, setCurrentStep } = useBooking();

    const [name, setName] = useState(formData.name);
    const [dob, setDob] = useState(formData.dob);

    // Parse existing tob into parts (e.g. "10:30 AM")
    const parseTob = (tob: string) => {
        const match = tob.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) return { hour: match[1], minute: match[2], period: match[3].toUpperCase() };
        return { hour: "", minute: "", period: "" };
    };
    const existingTob = parseTob(formData.tob);
    const [tobHour, setTobHour] = useState(existingTob.hour);
    const [tobMinute, setTobMinute] = useState(existingTob.minute);
    const [tobPeriod, setTobPeriod] = useState(existingTob.period);
    const [gender, setGender] = useState<Gender | "">(formData.gender || "");
    const [email, setEmail] = useState(formData.email);
    const [phone, setPhone] = useState(formData.phone);
    const [birthPlace, setBirthPlace] = useState(formData.birthPlace);
    const [concern, setConcern] = useState(formData.concern);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [placeSuggestions, setPlaceSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const placeRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (placeRef.current && !placeRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPlaceSuggestions = async (input: string) => {
        if (input.length < 3) {
            setPlaceSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/places?input=${encodeURIComponent(input)}`);
            const data = await res.json();
            if (data.predictions) {
                setPlaceSuggestions(data.predictions.map((p: { description: string }) => p.description));
                setShowSuggestions(true);
            }
        } catch {
            setPlaceSuggestions([]);
        }
    };

    const handlePlaceInput = (val: string) => {
        setBirthPlace(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => fetchPlaceSuggestions(val), 300);
    };

    const selectPlace = (place: string) => {
        setBirthPlace(place);
        setShowSuggestions(false);
        setPlaceSuggestions([]);
    };

    const validate = (): boolean => {
        const schema = z.object({
            name: z.string().min(1, "Name is required"),
            dob: z.string().min(1, "Date of birth is required"),
            tob: z.string().min(1, "Time of birth is required"),
            gender: z.string().min(1, "Gender is required"),
            email: z.string().email("Enter a valid email"),
            phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
            birthPlace: z.string().min(1, "Place of birth is required"),
            concern: z.string().min(10, "Please describe your concern (min 10 characters)"),
        });

        const tobStr = tobHour && tobMinute && tobPeriod ? `${tobHour}:${tobMinute} ${tobPeriod}` : "";
        const result = schema.safeParse({
            name: name.trim(),
            dob,
            tob: tobStr,
            gender,
            email: email.trim(),
            phone: phone.trim().replace(/\s/g, ""),
            birthPlace: birthPlace.trim(),
            concern: concern.trim(),
        });

        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) errs[err.path[0] as string] = err.message;
            });
            setErrors(errs);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleContinue = () => {
        if (!validate()) return;
        const tob = `${tobHour}:${tobMinute} ${tobPeriod}`;
        updateFormData({
            name: name.trim(),
            dob,
            tob,
            gender: gender as Gender,
            email: email.trim(),
            phone: phone.trim(),
            birthPlace: birthPlace.trim(),
            concern: concern.trim(),
        });
        setCurrentStep(6);
        router.push("/summary");
    };

    const inputClass = (field: string) =>
        cn(
            "w-full p-3 rounded-xl bg-cream-50 border-2 text-gray-800 placeholder-gray-400 focus:outline-none transition-colors duration-300",
            errors[field] ? "border-red-300 focus:border-red-400" : "border-cream-400/60 focus:border-gold-500"
        );

    return (
        <BookingLayout>
            <Stepper currentStep={5} />
            <StepCard
                title="Birth & Contact Details"
                subtitle="Enter the native's details for astrological analysis"
            >
                <div className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <User className="w-4 h-4 text-gold-600" />
                            Booking Person Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                            className={inputClass("name")}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* DOB & TOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Calendar className="w-4 h-4 text-gold-600" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className={inputClass("dob")}
                            />
                            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Clock className="w-4 h-4 text-gold-600" />
                                Time of Birth
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={tobHour}
                                    onChange={(e) => setTobHour(e.target.value)}
                                    className={cn(inputClass("tob"), "appearance-none cursor-pointer")}
                                >
                                    <option value="">Hr</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                        <option key={h} value={String(h)}>{h}</option>
                                    ))}
                                </select>
                                <select
                                    value={tobMinute}
                                    onChange={(e) => setTobMinute(e.target.value)}
                                    className={cn(inputClass("tob"), "appearance-none cursor-pointer")}
                                >
                                    <option value="">Min</option>
                                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                        <option key={m} value={String(m).padStart(2, "0")}>
                                            {String(m).padStart(2, "0")}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={tobPeriod}
                                    onChange={(e) => setTobPeriod(e.target.value)}
                                    className={cn(inputClass("tob"), "appearance-none cursor-pointer font-medium")}
                                >
                                    <option value="">AM/PM</option>
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                            {errors.tob && <p className="text-red-500 text-xs mt-1">{errors.tob}</p>}
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <User className="w-4 h-4 text-gold-600" />
                            Gender
                        </label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                            className={cn(inputClass("gender"), "appearance-none cursor-pointer")}
                        >
                            <option value="">Select gender...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Mail className="w-4 h-4 text-gold-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className={inputClass("email")}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Phone className="w-4 h-4 text-gold-600" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="9876543210"
                                className={inputClass("phone")}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Birth Place with Autocomplete */}
                    <div ref={placeRef} className="relative">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 text-gold-600" />
                            Place of Birth
                        </label>
                        <input
                            type="text"
                            value={birthPlace}
                            onChange={(e) => handlePlaceInput(e.target.value)}
                            placeholder="Start typing a city..."
                            className={inputClass("birthPlace")}
                            autoComplete="off"
                        />
                        {errors.birthPlace && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>
                        )}
                        {showSuggestions && placeSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 rounded-xl bg-white border border-cream-400/60 shadow-xl max-h-48 overflow-y-auto">
                                {placeSuggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectPlace(s)}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-colors border-b border-cream-300/50 last:border-0"
                                    >
                                        <MapPin className="w-3 h-3 inline mr-2 text-gold-500/50" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Concern */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <MessageSquare className="w-4 h-4 text-gold-600" />
                            Detailed Concern
                        </label>
                        <textarea
                            value={concern}
                            onChange={(e) => setConcern(e.target.value)}
                            placeholder="Describe your concerns or questions for the astrologer..."
                            rows={4}
                            className={cn(inputClass("concern"), "resize-none")}
                        />
                        {errors.concern && <p className="text-red-500 text-xs mt-1">{errors.concern}</p>}
                    </div>

                    {/* Continue */}
                    <button
                        onClick={handleContinue}
                        className="w-full py-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
                    >
                        Review Summary
                    </button>
                </div>
            </StepCard>
        </BookingLayout>
    );
}
