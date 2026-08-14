'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ArrowLeft, Calendar, Clock} from 'lucide-react';
import { MainButton } from '@/components/button';

interface SetScheduleProps {
    onBack : () => void;
    onNext : (data : ScheduleData) => void;
    isLoading?: boolean;
}

interface ScheduleData {
    startDate : string;
    startTime : string;
    endDate : string;
    endTime : string;
}

const SetSchedule : React.FC < SetScheduleProps > = ({
    onBack,
    onNext,
    isLoading = false
}) => {
    const [startDate,
        setStartDate] = useState('');
    const [startTime,
        setStartTime] = useState('');
    const [endDate,
        setEndDate] = useState('');
    const [endTime,
        setEndTime] = useState('');

    const handleNext = () => {
        onNext({startDate, startTime, endDate, endTime});
    };

    const isFormValid = startDate && startTime && endDate && endTime;

    return (
        <div
            className="min-h-screen bg-black-100 text-white font-recursive flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header with Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                    <span className="text-sm">Go back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Set Schedule</h1>
                    <p className="text-white/50 text-sm">Choose when your Drop begins and ends.</p>
                </div>

                {/* Form */}
                <div className="space-y-8 mb-12">
                    {/* Start Date & Time */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-light text-white/70 mb-3">
                                Start Date
                            </label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    placeholder="Select a date"
                                    className="bg-black-200 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4 pr-12"/>
                                <Calendar
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-light text-white/70 mb-3">
                                Time
                            </label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    placeholder="Enter a time"
                                    className="bg-black-200 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4 pr-12"/>
                                <Clock
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none"/>
                            </div>
                        </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-light text-white/70 mb-3">
                                End Date
                            </label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    placeholder="Select a date"
                                    className="bg-black-200 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4 pr-12"/>
                                <Calendar
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-light text-white/70 mb-3">
                                Time
                            </label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    placeholder="Enter a time"
                                    className="bg-black-200 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4 pr-12"/>
                                <Clock
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none"/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-full h-14 font-medium text-base">
                        Back
                    </Button>
                    <MainButton
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || !isFormValid}
                        className="bg-primary-500 hover:bg-primary-600 text-white rounded-full h-14 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        {isLoading
                            ? 'Processing...'
                            : 'Next'}
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default SetSchedule;