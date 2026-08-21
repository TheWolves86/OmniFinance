import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

import {
  getAllInsurance,
  deleteInsurance,
  Insurance,
} from "@/src/db/repository/insurance";

import {
  presentInsuranceSheet,
  subscribeInsuranceRefresh,
} from "@/src/components/insuranceSheetController";

import InsuranceBottomSheet from "@/src/components/insuranceBottomSheet";

export default function InsurancePage() {
  const router = useRouter();

  const [policies, setPolicies] =
    useState<Insurance[]>([]);

  const loadInsurance = useCallback(
    async () => {
      try {
        const data = await getAllInsurance();
        setPolicies(data ?? []);
      } catch (error) {
        console.error(
          "Error loading insurance: " + String(error)
        );
      }
    },
    []
  );

  useEffect(() => {
    loadInsurance();

    const unsubscribe =
      subscribeInsuranceRefresh(() => {
        loadInsurance();
      });

    return unsubscribe;
  }, [loadInsurance]);

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatRenewalDate = (date: number) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  const handleDelete = (policy: Insurance) => {
    Alert.alert(
      "Delete policy?",
      `This will permanently remove ${policy.policyName}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInsurance(policy.id);
              await loadInsurance();
            } catch (error) {
              console.error("Error deleting insurance: " + String(error));
            }
          },
        },
      ]
    );
  };

  const renderPolicy = ({
    item,
  }: {
    item: Insurance;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.policyCard,
          pressed && styles.policyCardPressed,
        ]}
        onPress={() =>
          presentInsuranceSheet({
            mode: "edit",
            insurance: item,
          })
        }
        onLongPress={() => handleDelete(item)}
        android_ripple={{ color: "#EEF1F5" }}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.providerName} ${item.policyName}`}
      >
        <View style={styles.policyIcon}>
          <Ionicons
            name={
              item.policyType.toLowerCase() ===
              "life"
                ? "heart-outline"
                : item.policyType.toLowerCase() ===
                  "car"
                ? "car-outline"
                : "shield-checkmark-outline"
            }
            size={18}
            color="#0B1D3A"
          />
        </View>

        <View style={styles.policyInfo}>
          <Text style={styles.providerName}>
            {item.providerName}
          </Text>

          <Text style={styles.policyMeta}>
            {item.policyName} • Renews{" "}
            {formatRenewalDate(
              item.renewalDate
            )}
          </Text>
        </View>

        <View style={styles.policyRight}>
          <Text style={styles.premiumAmount}>
            {formatAmount(
              item.premiumAmount
            )}
          </Text>

          <Text style={styles.premiumLabel}>
            Premium
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color="#B0B6C3"
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={policies}
        keyExtractor={(item) => item.id}
        renderItem={renderPolicy}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color="#0B1D3A"
                />
              </Pressable>

              <Text style={styles.topBarTitle}>
                Insurance
              </Text>

              <View style={styles.moreButton}>
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color="#0B1D3A"
                />
              </View>
            </View>

            <Text style={styles.heading}>
              Insurance
            </Text>
          </View>
        }
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [
              styles.addPolicyButton,
              pressed && styles.addPolicyButtonPressed,
            ]}
            onPress={() =>
              presentInsuranceSheet({
                mode: "create",
              })
            }
          >
            <View style={styles.plusCircle}>
              <Ionicons
                name="add"
                size={18}
                color="#0B1D3A"
              />
            </View>

            <Text style={styles.addPolicyText}>
              Add New Policy
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#B0B6C3"
            />
          </Pressable>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="shield-checkmark-outline"
              size={44}
              color="#C7CDD7"
            />

            <Text style={styles.emptyTitle}>
              No Insurance Policies
            </Text>

            <Text style={styles.emptySubtitle}>
              Add a policy to start tracking
              renewals and premiums.
            </Text>
          </View>
        }
      />

      <InsuranceBottomSheet />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  moreButton: {
    width: 36,
    height: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  heading: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  policyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
  },

  policyCardPressed: {
    backgroundColor: "#F1F4F8",
  },

  policyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F3F6",
    justifyContent: "center",
    alignItems: "center",
  },

  policyInfo: {
    flex: 1,
    marginLeft: 9,
    marginRight: 6,
  },

  providerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  policyMeta: {
    marginTop: 5,
    fontSize: 11,
    color: "#7B8190",
  },

  policyRight: {
    alignItems: "flex-end",
    marginRight: 6,
  },

  premiumAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  premiumLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#8A93A6",
  },

  addPolicyButton: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  addPolicyButtonPressed: {
    backgroundColor: "#F1F4F8",
  },

  plusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F3F6",
    justifyContent: "center",
    alignItems: "center",
  },

  addPolicyText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 10,
    fontWeight: "600",
    color: "#0B1D3A",
  },

  emptyState: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    color: "#7B8190",
  },
});
//
