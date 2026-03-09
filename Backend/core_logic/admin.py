from django.contrib import admin
from .models import Contract, RiskCategory, RiskFinding, ContractSummary


class RiskFindingInline(admin.TabularInline):
    model = RiskFinding
    extra = 0
    readonly_fields = ('original_text', 'risk_explanation', 'severity_level', 'suggested_alternative')


class ContractSummaryInline(admin.StackedInline):
    model = ContractSummary
    extra = 0
    readonly_fields = ('overall_score', 'executive_summary')


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'status', 'uploaded_at', 'processed_at')
    list_filter = ('status', 'uploaded_at')
    search_fields = ('original_filename',)
    readonly_fields = ('id', 'uploaded_at', 'processed_at', 'raw_llm_response')
    inlines = [ContractSummaryInline, RiskFindingInline]


@admin.register(RiskCategory)
class RiskCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(RiskFinding)
class RiskFindingAdmin(admin.ModelAdmin):
    list_display = ('contract', 'category', 'severity_level', 'original_text_preview')
    list_filter = ('severity_level', 'category')
    search_fields = ('original_text', 'risk_explanation')

    @admin.display(description='Original Text')
    def original_text_preview(self, obj):
        return obj.original_text[:80] + '...' if len(obj.original_text) > 80 else obj.original_text


@admin.register(ContractSummary)
class ContractSummaryAdmin(admin.ModelAdmin):
    list_display = ('contract', 'overall_score')
    readonly_fields = ('contract', 'overall_score', 'executive_summary')
