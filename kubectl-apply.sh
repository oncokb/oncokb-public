#!/bin/bash
# Files are ordered in proper order with needed wait for the dependent custom resource definitions to get initialized.
# Usage: bash kubectl-apply.sh

logSummary(){
    echo ""
    echo "#####################################################"
    echo "Please find the below useful endpoints,"
    echo "oncokb - http://oncokb.default.192.168.99.100.nip.io"
    echo "#####################################################"
}

kubectl apply -f k8s/

logSummary
