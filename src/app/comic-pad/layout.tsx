"use client";
import React, { useEffect } from "react";
import ComicPadlayout from "./_components/ComicPadlayout";
import StartNewComicFast from "./_components/StartNewComicFast";
import RecentFile from "./_components/RecentFile";
import AppMenu from "@/components/global/AppMenu";
import { useDisclosure } from "@heroui/react";
import { UserProfileFlowModal } from "@/components/modals/UserProfile";
import GeneralModal from "@/components/modals/GeneralModal";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { creatorRegister } from "@/redux/slices/walletSlice";

const layout = ({children}) => {
    const { user } = useAppSelector((state:any) => state.wallet);
    const dispatch = useAppDispatch();

    const {
        isOpen: isUserProfileOpen,
        onOpen: onOpenUserProfile,
        onOpenChange: onOpenChangeUserProfile,
        onClose: onCloseUserProfile,
    } = useDisclosure();

    useEffect(() => {
        console.log(user);
        // If user is not a creator or username is not set, assign role and open profile modal
        if(user?.role.filter(role => role === 'creator').length === 0) {
            dispatch(creatorRegister(user._id as string));
        }
        if (!user?.username) {
            onOpenUserProfile();
        }
    }, []);

    const handleProfileComplete = () => {
        // Close the user profile modal
        onCloseUserProfile();
    };

    return (
        <>
            <ComicPadlayout>
                {children}
                <AppMenu />
            </ComicPadlayout>

            {/* User Profile Flow Modal */}
            <GeneralModal
                isOpen={isUserProfileOpen}
                onOpenChange={onOpenChangeUserProfile}
                onClose={onCloseUserProfile}
                backdrop='blur'
                size='xl'
            >
                <UserProfileFlowModal
                    onClose={onCloseUserProfile}
                    onComplete={handleProfileComplete}
                />
            </GeneralModal>
        </>
    );
};

export default layout;
