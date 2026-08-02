import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react"
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, Text, View} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

type AccountDetails = {
    id: string,
    name: string,
    type: string,
    balance: number,
    currency: string,
    icon?: string | null
    color?: string | null
    isDefault?: boolean
    createdAt?: number
}

type Props = {
    visible: boolean,
    account: AccountDetails | null,
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void
}

const AccountDetailsBottomSheet = forwardRef<BottomSheetModal, Props>(
  (props, ref) => {
    const modalRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();

    useImperativeHandle(
        ref,
        () => modalRef.current as BottomSheetModal,
        [modalRef]
    );

    useEffect(() => {
        if (!props.visible) {
            modalRef.current?.dismiss();
            return
        }
        modalRef.current?.present();
    }, [props.visible])

    const renderBackdrop = useMemo(
        () =>
            (backdropProps: any) => (
                <BottomSheetBackdrop
                    {...backdropProps}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.35}
                    pressBehavior="close"
                />
            ),
        []
    );
    const balanceText = props.account?.balance != null ? `₹${props.account.balance.toLocaleString("en-IN")}` : "-";
    const createdText = props.account?.createdAt != null ? new Date(props.account.createdAt).toLocaleString("en-IN") : "Not Available";
    return (
        <BottomSheetModal
            ref={modalRef}
            index={0}
            snapPoints={["70%"]}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            bottomInset={insets.bottom}
            topInset={insets.top}
            onDismiss={props.onClose}
        >
            
        </BottomSheetModal>
    )
  }
)
const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 12
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0B1D3A"
    },
    subtitle: {
        marginTop: 4,
        color: "#7B8190",
        fontSize: 13
    },
    closeText: {
        color: "#6B7280",
        fontSize: 15,
        fontWeight: "600"
    },
    summaryCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
    },
    iconCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center"
    },
    summaryText: {
        marginLeft: 12,
        flex: 1,
    },
    accountName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0B1D3A"
    }
})
//
