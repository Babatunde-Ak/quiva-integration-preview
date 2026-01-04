import React from "react";
import { Modal, ModalContent, ModalProps } from "@heroui/react";

type BackdropType = "transparent" | "blur" | "opaque";
type ShadowSize = "sm" | "md" | "lg" | "none";
type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
type radiusSize = "sm" | "md" | "lg" | "none";

interface GeneralModalProps {
	/** Controls whether the modal is open */
	isOpen: boolean;
	/** Callback when the modal open state changes */
	onOpenChange: (isOpen: boolean) => void;
	/** Callback when the modal needs to close (used if no children provided) */
	onClose?: () => void;
	/** Custom modal content (overrides default WhitePaperModal) */
	children?: React.ReactNode;
	/** Size of the modal */
	size?: ModalSize;
	radius?: radiusSize;
	/** Backdrop style */
	backdrop?: BackdropType;
	/** Shadow size */
	shadow?: ShadowSize;
	/** Additional classes for ModalContent */
	modalContentClass?: string;
	/** Whether to show gradient shadow effect */
	borderGradient?: string;
	/** Tailwind gradient colors (e.g., "from-purple-500 to-pink-500") */
}

const GeneralModal: React.FC<GeneralModalProps> = ({
	isOpen,
	onOpenChange,
	onClose,
	children,
	size = "xl",
	radius = "lg",
	backdrop = "blur",
	shadow = "lg",
	modalContentClass = "p-0 bg-black-500",
	borderGradient = "",
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			backdrop={backdrop}
			radius={radius}
			size={size}
			shadow={shadow}
			isDismissable={false} // Prevent closing on outside click or ESC key
		>
			<ModalContent
				className={`${modalContentClass} ${
					borderGradient
						? `relative after:absolute after:inset-0 after:-z-10 after:translate-y-2 after:bg-gradient-to-r ${borderGradient} after:blur-md after:rounded-lg`
						: ""
				}`}
			>
				{children}
			</ModalContent>
		</Modal>
	);
};

export default GeneralModal;
