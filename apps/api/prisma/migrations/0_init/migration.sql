-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('MX', 'CO', 'CL', 'PE', 'AR', 'OTHER');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MXN', 'USD', 'COP', 'CLP', 'PEN', 'ARS');

-- CreateEnum
CREATE TYPE "PosProvider" AS ENUM ('SOFT_RESTAURANT', 'ONECORE', 'CLIP', 'SQUARE', 'TOAST', 'MANUAL_CSV');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('DINE_IN', 'TAKEOUT', 'DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "DeliveryProvider" AS ENUM ('RAPPI', 'UBER_EATS', 'DIDI_FOOD', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "Daypart" AS ENUM ('BREAKFAST', 'BRUNCH', 'LUNCH', 'AFTERNOON', 'DINNER', 'LATE_NIGHT');

-- CreateEnum
CREATE TYPE "RecommendationKind" AS ENUM ('STAFFING_ADJUST', 'PAR_LEVEL_ADJUST', 'PREP_LIST', 'MENU_REPRICE', 'MENU_PROMOTE', 'DISCOUNT_REVIEW', 'GUEST_CAMPAIGN', 'WASTE_ALERT', 'ANOMALY_TRIAGE', 'RECIPE_REFORMULATE');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'APPROVED', 'EXECUTED', 'REJECTED', 'SNOOZED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AnomalyKind" AS ENUM ('VOID_SPIKE', 'DISCOUNT_SPIKE', 'FOOD_COST_DRIFT', 'LABOR_OVERSHOOT', 'NO_SALE', 'REFUND_BURST', 'INGREDIENT_PRICE_JUMP');

-- CreateEnum
CREATE TYPE "GuestSegment" AS ENUM ('VIP', 'BIG_SPENDER', 'REGULAR', 'FIRST_VISIT', 'CHURN_RISK', 'LAPSED');

-- CreateEnum
CREATE TYPE "CampaignChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'WAITLIST');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('RECEIVED', 'OCR_PENDING', 'OCR_DONE', 'NORMALIZED', 'REJECTED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_PAYMENT', 'PLACED', 'IN_KITCHEN', 'READY', 'SERVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('MOBILE', 'CASHIER');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" "Country" NOT NULL DEFAULT 'MX',
    "currency" "Currency" NOT NULL DEFAULT 'MXN',
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MANAGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "pos_provider" "PosProvider" NOT NULL DEFAULT 'MANUAL_CSV',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "user_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("user_id","location_id")
);

-- CreateTable
CREATE TABLE "PosCredential" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "provider" "PosProvider" NOT NULL,
    "api_key" TEXT,
    "api_secret" TEXT,
    "store_id" TEXT,
    "webhook_secret" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_key" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "category_id" TEXT,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_cents" INTEGER NOT NULL,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.16,
    "image_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" DECIMAL(2,1),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base_unit" TEXT NOT NULL,
    "shelf_life_days" INTEGER,
    "perishable" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "default_supplier_id" TEXT,
    "cost_per_unit_cents" INTEGER,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "yield_qty" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "yield_unit" TEXT NOT NULL DEFAULT 'pza',
    "food_cost_cents" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeLine" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "qty" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "RecipeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rfc" TEXT,
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "file_url" TEXT NOT NULL,
    "total_cents" INTEGER,
    "invoiced_at" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'RECEIVED',
    "ocr_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "ingredient_id" TEXT,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_cost_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesEvent" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "pos_external_id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL DEFAULT 'DINE_IN',
    "delivery_provider" "DeliveryProvider",
    "opened_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),
    "total_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL,
    "tip_cents" INTEGER NOT NULL DEFAULT 0,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "voided_cents" INTEGER NOT NULL DEFAULT 0,
    "covers" INTEGER NOT NULL DEFAULT 0,
    "guest_external_id" TEXT,
    "raw_payload" JSONB,

    CONSTRAINT "SalesEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesLine" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "menu_item_id" TEXT,
    "description" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "unit_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "voided" BOOLEAN NOT NULL DEFAULT false,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SalesLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesPayment" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "processor" TEXT,

    CONSTRAINT "SalesPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastBucket" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "daypart" "Daypart" NOT NULL,
    "channel" "Channel" NOT NULL DEFAULT 'DINE_IN',
    "expected_covers" INTEGER NOT NULL,
    "expected_revenue_cents" INTEGER NOT NULL,
    "confidence_low_cents" INTEGER NOT NULL,
    "confidence_high_cents" INTEGER NOT NULL,
    "mape" DECIMAL(6,4),
    "model_version" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "daypart" "Daypart" NOT NULL,
    "role" TEXT NOT NULL,
    "staff_needed" INTEGER NOT NULL,
    "staff_suggested" INTEGER NOT NULL,
    "staff_actual" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'forecast',

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParLevel" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "suggested_qty" DECIMAL(12,4) NOT NULL,
    "current_qty" DECIMAL(12,4),
    "unit" TEXT NOT NULL,

    CONSTRAINT "ParLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCount" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "counted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "counted_by" TEXT,

    CONSTRAINT "InventoryCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCountLine" (
    "id" TEXT NOT NULL,
    "count_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "qty" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "InventoryCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepList" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "daypart" "Daypart" NOT NULL,

    CONSTRAINT "PrepList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepLine" (
    "id" TEXT NOT NULL,
    "prep_list_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "qty" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "PrepLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "kind" "AnomalyKind" NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "anomaly_id" TEXT,
    "kind" "RecommendationKind" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "estimated_impact_cents" INTEGER,
    "payload" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actual_impact_cents" INTEGER,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "birthdate" DATE,
    "first_visit_at" TIMESTAMP(3),
    "last_visit_at" TIMESTAMP(3),
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "total_spent_cents" INTEGER NOT NULL DEFAULT 0,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "GuestSegment" NOT NULL,
    "rules" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSegmentLink" (
    "guest_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestSegmentLink_pkey" PRIMARY KEY ("guest_id","segment_id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "channel" "CampaignChannel" NOT NULL,
    "template_id" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSend" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "conversion_cents" INTEGER,

    CONSTRAINT "CampaignSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "guest_name" TEXT NOT NULL,
    "guest_phone" TEXT NOT NULL,
    "party_size" INTEGER NOT NULL,
    "reserved_at" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'whatsapp',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "source" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "sentiment" DECIMAL(4,3),
    "topics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "payment_method" "OrderPaymentMethod" NOT NULL,
    "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "customer_name" TEXT,
    "table_label" TEXT,
    "notes" TEXT,
    "payment_ref" TEXT,
    "subtotal_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "menu_item_id" TEXT,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "unit_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenant_id_idx" ON "User"("tenant_id");

-- CreateIndex
CREATE INDEX "Location_tenant_id_idx" ON "Location"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Location_tenant_id_slug_key" ON "Location"("tenant_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "PosCredential_location_id_key" ON "PosCredential"("location_id");

-- CreateIndex
CREATE INDEX "MenuCategory_tenant_id_idx" ON "MenuCategory"("tenant_id");

-- CreateIndex
CREATE INDEX "MenuItem_tenant_id_idx" ON "MenuItem"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_tenant_id_sku_key" ON "MenuItem"("tenant_id", "sku");

-- CreateIndex
CREATE INDEX "Ingredient_tenant_id_idx" ON "Ingredient"("tenant_id");

-- CreateIndex
CREATE INDEX "Ingredient_default_supplier_id_idx" ON "Ingredient"("default_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_tenant_id_sku_key" ON "Ingredient"("tenant_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_menu_item_id_key" ON "Recipe"("menu_item_id");

-- CreateIndex
CREATE INDEX "Recipe_tenant_id_idx" ON "Recipe"("tenant_id");

-- CreateIndex
CREATE INDEX "RecipeLine_recipe_id_idx" ON "RecipeLine"("recipe_id");

-- CreateIndex
CREATE INDEX "RecipeLine_ingredient_id_idx" ON "RecipeLine"("ingredient_id");

-- CreateIndex
CREATE INDEX "Supplier_tenant_id_idx" ON "Supplier"("tenant_id");

-- CreateIndex
CREATE INDEX "Invoice_location_id_idx" ON "Invoice"("location_id");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoice_id_idx" ON "InvoiceLine"("invoice_id");

-- CreateIndex
CREATE INDEX "InvoiceLine_ingredient_id_idx" ON "InvoiceLine"("ingredient_id");

-- CreateIndex
CREATE INDEX "SalesEvent_location_id_opened_at_idx" ON "SalesEvent"("location_id", "opened_at");

-- CreateIndex
CREATE UNIQUE INDEX "SalesEvent_location_id_pos_external_id_key" ON "SalesEvent"("location_id", "pos_external_id");

-- CreateIndex
CREATE INDEX "SalesLine_sale_id_idx" ON "SalesLine"("sale_id");

-- CreateIndex
CREATE INDEX "SalesPayment_sale_id_idx" ON "SalesPayment"("sale_id");

-- CreateIndex
CREATE INDEX "ForecastBucket_location_id_date_idx" ON "ForecastBucket"("location_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastBucket_location_id_date_daypart_channel_key" ON "ForecastBucket"("location_id", "date", "daypart", "channel");

-- CreateIndex
CREATE INDEX "Shift_location_id_date_idx" ON "Shift"("location_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_location_id_date_daypart_role_key" ON "Shift"("location_id", "date", "daypart", "role");

-- CreateIndex
CREATE UNIQUE INDEX "ParLevel_location_id_ingredient_id_date_key" ON "ParLevel"("location_id", "ingredient_id", "date");

-- CreateIndex
CREATE INDEX "InventoryCount_location_id_counted_at_idx" ON "InventoryCount"("location_id", "counted_at");

-- CreateIndex
CREATE INDEX "InventoryCountLine_count_id_idx" ON "InventoryCountLine"("count_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrepList_location_id_date_daypart_key" ON "PrepList"("location_id", "date", "daypart");

-- CreateIndex
CREATE INDEX "PrepLine_prep_list_id_idx" ON "PrepLine"("prep_list_id");

-- CreateIndex
CREATE INDEX "Anomaly_location_id_detected_at_idx" ON "Anomaly"("location_id", "detected_at");

-- CreateIndex
CREATE INDEX "Anomaly_kind_idx" ON "Anomaly"("kind");

-- CreateIndex
CREATE INDEX "Recommendation_tenant_id_status_idx" ON "Recommendation"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "Recommendation_location_id_created_at_idx" ON "Recommendation"("location_id", "created_at");

-- CreateIndex
CREATE INDEX "ActionLog_recommendation_id_idx" ON "ActionLog"("recommendation_id");

-- CreateIndex
CREATE INDEX "Guest_tenant_id_idx" ON "Guest"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_tenant_id_phone_key" ON "Guest"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "Segment_tenant_id_idx" ON "Segment"("tenant_id");

-- CreateIndex
CREATE INDEX "Campaign_tenant_id_status_idx" ON "Campaign"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "CampaignSend_campaign_id_idx" ON "CampaignSend"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSend_campaign_id_guest_id_key" ON "CampaignSend"("campaign_id", "guest_id");

-- CreateIndex
CREATE INDEX "Reservation_location_id_reserved_at_idx" ON "Reservation"("location_id", "reserved_at");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Review_location_id_created_at_idx" ON "Review"("location_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");

-- CreateIndex
CREATE INDEX "Order_tenant_id_created_at_idx" ON "Order"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "Order_location_id_status_idx" ON "Order"("location_id", "status");

-- CreateIndex
CREATE INDEX "OrderItem_order_id_idx" ON "OrderItem"("order_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosCredential" ADD CONSTRAINT "PosCredential_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "MenuCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_default_supplier_id_fkey" FOREIGN KEY ("default_supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeLine" ADD CONSTRAINT "RecipeLine_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeLine" ADD CONSTRAINT "RecipeLine_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesEvent" ADD CONSTRAINT "SalesEvent_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesLine" ADD CONSTRAINT "SalesLine_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "SalesEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesLine" ADD CONSTRAINT "SalesLine_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "SalesEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastBucket" ADD CONSTRAINT "ForecastBucket_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParLevel" ADD CONSTRAINT "ParLevel_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParLevel" ADD CONSTRAINT "ParLevel_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_count_id_fkey" FOREIGN KEY ("count_id") REFERENCES "InventoryCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepList" ADD CONSTRAINT "PrepList_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepLine" ADD CONSTRAINT "PrepLine_prep_list_id_fkey" FOREIGN KEY ("prep_list_id") REFERENCES "PrepList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepLine" ADD CONSTRAINT "PrepLine_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "Anomaly"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestSegmentLink" ADD CONSTRAINT "GuestSegmentLink_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestSegmentLink" ADD CONSTRAINT "GuestSegmentLink_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "Segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSend" ADD CONSTRAINT "CampaignSend_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSend" ADD CONSTRAINT "CampaignSend_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

