"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import DashboardaModal from "../modals/DashboardaModal";
import DashboardbModal from "../modals/DashboardbModal";
import DashboardcModal from "../modals/DashboardcModal";
import DashboarddModal from "../modals/DashboarddModal";
import Dashboard_FilledModal from "../modals/Dashboard_FilledModal";
import GeneralModal from "../modals/GeneralModal";

interface OnboardingManagerProps {
	isOpen: boolean;
	onClose: () => void;
	userType?: "reader" | "creator";
}

const OnboardingManager = ({ isOpen, onClose, userType = "reader" }: OnboardingManagerProps) => {
	const [currentStep, setCurrentStep] = useState(1);
	const router = useRouter();
	const totalSteps = 5;

	const handleNext = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		} else {
			// Complete onboarding
			handleComplete();
		}
	};

	const handleSkip = () => {
		handleComplete();
	};

	const handleComplete = () => {
		onClose();
		// Always route to marketplace after onboarding
		// Users can become creators from marketplace
		router.push("/marketplace");
	};

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<DashboardaModal 
						onNext={handleNext} 
						onSkip={handleSkip} 
						totalSteps={totalSteps}
					/>
				);
			case 2:
				return (
					<DashboardbModal 
						onNext={handleNext} 
						onSkip={handleSkip} 
						totalSteps={totalSteps}
					/>
				);
			case 3:
				return (
					<DashboardcModal 
						onNext={handleNext} 
						onSkip={handleSkip} 
						totalSteps={totalSteps}
					/>
				);
			case 4:
				return (
					<DashboarddModal 
						onNext={handleNext} 
						onSkip={handleSkip} 
						totalSteps={totalSteps}
					/>
				);
			case 5:
				return (
					<Dashboard_FilledModal 
						onNext={handleComplete} 
						onSkip={handleComplete} 
						totalSteps={totalSteps}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<GeneralModal
			isOpen={isOpen}
			onOpenChange={() => {}}
			onClose={onClose}
			backdrop="blur"
			size="xl"
		>
			{renderCurrentStep()}
		</GeneralModal>
	);
};

export default OnboardingManager;