locals {
  # Canonical prefix for every resource name: <project>-<env>-<region>
  name_prefix = "${var.project}-${var.environment}-${var.location_short}"

  common_tags = {
    project     = var.project
    environment = var.environment
    location    = var.location
    managed_by  = "Terraform"
  }
}
