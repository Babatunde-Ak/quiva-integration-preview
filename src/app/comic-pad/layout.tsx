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

const Layout = ({children}) => {
    const { user } = useAppSelector((state:any) => state.wallet);
    const dispatch = useAppDispatch();

    const {
        isOpen: isUserProfileOpen,
        onOpen: onOpenUserProfile,
        onOpenChange: onOpenChangeUserProfile,
        onClose: onCloseUserProfile,
    } = useDisclosure();

    useEffect(() => {
        if (user?.role) {
            const isCreator = user.role.includes("creator");
            
            if (!isCreator) {
                dispatch(creatorRegister(user._id as string));
                onOpenUserProfile();
            }
        }
    }, [user, dispatch, onOpenUserProfile]);

    const handleProfileComplete = () => {
        // Close the user profile modal
        onCloseUserProfile();
    };

    return (
        <>
            <ComicPadlayout>
                {children}
                {/* <AppMenu /> */}
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

export default Layout;
