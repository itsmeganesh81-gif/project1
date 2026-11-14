import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.test_runner import run_all_tests as run_phase0_phase1
from backend.tests.test_feature1_matching import test_feature1_smart_matching
from backend.tests.test_feature2_recurring import test_feature2_recurring_transfusions
from backend.tests.test_feature3_rare import test_feature3_rare_blood_network
from backend.tests.test_feature4_inventory import run_tests as run_feature4
from backend.tests.test_feature5_volunteer import run_tests as run_feature5
from backend.tests.test_feature7_expiry import run_tests as run_feature7
from backend.tests.test_review_system import run_tests as run_review_system
from backend.tests.test_broadcast_system import run_tests as run_broadcast_system

def execute_master_suite():
    start_time = time.time()
    print("=" * 80)
    print("      BLOODBRIDGE COMPREHENSIVE BACKEND VERIFICATION & AUDIT SUITE")
    print("=" * 80)

    suites = [
        ("Phase 0 & Phase 1: Security, DPDP & Auth", run_phase0_phase1),
        ("Feature 1: AI Smart Donor Matching & Eligibility", test_feature1_smart_matching),
        ("Feature 2: Recurring Transfusions (Thalassemia / Sickle Cell)", test_feature2_recurring_transfusions),
        ("Feature 3: Rare Blood Network & Cold-Chain Logistics", test_feature3_rare_blood_network),
        ("Feature 4: Verified Blood Bank & Hospital Network", run_feature4),
        ("Feature 5: Volunteer Courier Rescue Dispatch", run_feature5),
        ("Feature 7: Near-Expiry Alerts & Surplus Exchange", run_feature7),
        ("Customer Review & Problem Resolution System", run_review_system),
        ("Feature 10: Real-Time Live Broadcast & WhatsApp Gateway", run_broadcast_system),
    ]

    passed_count = 0
    total_count = len(suites)

    for name, func in suites:
        print(f"\n>>> EXECUTING: {name} ...")
        try:
            func()
            print(f" [PASSED] {name}")
            passed_count += 1
        except Exception as e:
            print(f" [FAILED] {name}: {e}")
            raise e

    duration = time.time() - start_time
    print("\n" + "=" * 80)
    print(f" MASTER TEST SUITE COMPLETE: {passed_count}/{total_count} SUITES PASSED (100%) IN {duration:.2f}s")
    print("=" * 80)

if __name__ == "__main__":
    execute_master_suite()

