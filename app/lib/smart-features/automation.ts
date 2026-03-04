/**
 * Automation workflows and rules engine
 * Execute actions based on ticket triggers and conditions
 */

export type TriggerType = 'ticket_created' | 'ticket_assigned' | 'comment_added' | 'status_changed' | 'priority_changed';
export type ConditionOperator = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches_regex';
export type ActionType = 'send_email' | 'assign' | 'set_priority' | 'set_status' | 'add_tag' | 'notify_team';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: TriggerType;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: string | number;
}

export interface Action {
  type: ActionType;
  parameters: Record<string, any>;
}

export interface WorkflowExecutionResult {
  ruleId: string;
  triggered: boolean;
  actionsExecuted: string[];
  errors: string[];
}

/**
 * Automation engine
 */
export class AutomationEngine {
  private rules: AutomationRule[] = [];

  /**
   * Add rule
   */
  addRule(rule: AutomationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<AutomationRule>): void {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  /**
   * Execute rules for trigger
   */
  async executeTrigger(
    trigger: TriggerType,
    data: Record<string, any>
  ): Promise<WorkflowExecutionResult[]> {
    const applicableRules = this.rules.filter(
      (r) => r.enabled && r.trigger === trigger
    );

    const results: WorkflowExecutionResult[] = [];

    for (const rule of applicableRules) {
      const result = await this.executeRule(rule, data);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute single rule
   */
  private async executeRule(
    rule: AutomationRule,
    data: Record<string, any>
  ): Promise<WorkflowExecutionResult> {
    const result: WorkflowExecutionResult = {
      ruleId: rule.id,
      triggered: false,
      actionsExecuted: [],
      errors: [],
    };

    try {
      // Check all conditions
      const conditionsMet = this.evaluateConditions(rule.conditions, data);

      if (!conditionsMet) {
        return result;
      }

      result.triggered = true;

      // Execute all actions
      for (const action of rule.actions) {
        try {
          await this.executeAction(action, data);
          result.actionsExecuted.push(action.type);
        } catch (error: any) {
          result.errors.push(`Failed to execute ${action.type}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Rule execution failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(conditions: Condition[], data: Record<string, any>): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, data));
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: Condition, data: Record<string, any>): boolean {
    const fieldValue = this.getFieldValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'matches_regex':
        try {
          const regex = new RegExp(String(condition.value));
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Get nested field value
   */
  private getFieldValue(data: Record<string, any>, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, field) => obj?.[field], data);
  }

  /**
   * Execute action
   */
  private async executeAction(
    action: Action,
    data: Record<string, any>
  ): Promise<void> {
    switch (action.type) {
      case 'send_email':
        await this.sendEmailAction(action.parameters);
        break;
      case 'assign':
        await this.assignAction(action.parameters, data);
        break;
      case 'set_priority':
        await this.setPriorityAction(action.parameters, data);
        break;
      case 'set_status':
        await this.setStatusAction(action.parameters, data);
        break;
      case 'add_tag':
        await this.addTagAction(action.parameters, data);
        break;
      case 'notify_team':
        await this.notifyTeamAction(action.parameters);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Action implementations
   */
  private async sendEmailAction(params: Record<string, any>): Promise<void> {
    console.log('[Automation] Sending email to:', params.email);
    // Implementation would send actual email
  }

  private async assignAction(
    params: Record<string, any>,
    data: Record<string, any>
  ): Promise<void> {
    console.log('[Automation] Assigning ticket to:', params.engineer);
    // Implementation would update ticket assignment
  }

  private async setPriorityAction(
    params: Record<string, any>,
    data: Record<string, any>
  ): Promise<void> {
    console.log('[Automation] Setting priority to:', params.priority);
    // Implementation would update ticket priority
  }

  private async setStatusAction(
    params: Record<string, any>,
    data: Record<string, any>
  ): Promise<void> {
    console.log('[Automation] Setting status to:', params.status);
    // Implementation would update ticket status
  }

  private async addTagAction(
    params: Record<string, any>,
    data: Record<string, any>
  ): Promise<void> {
    console.log('[Automation] Adding tag:', params.tag);
    // Implementation would add tag to ticket
  }

  private async notifyTeamAction(params: Record<string, any>): Promise<void> {
    console.log('[Automation] Notifying team:', params.team);
    // Implementation would send team notification
  }
}

/**
 * Preset automation rules
 */
export const PRESET_RULES = {
  CRITICAL_TICKET_NOTIFICATION: {
    name: 'Notify team on critical tickets',
    trigger: 'ticket_created' as TriggerType,
    conditions: [
      {
        field: 'priority',
        operator: 'equals' as ConditionOperator,
        value: 'critical',
      },
    ],
    actions: [
      {
        type: 'notify_team' as ActionType,
        parameters: { team: 'all' },
      },
    ],
  },

  AUTO_PRIORITY_ESCALATION: {
    name: 'Escalate high-priority unassigned tickets',
    trigger: 'ticket_created' as TriggerType,
    conditions: [
      {
        field: 'priority',
        operator: 'equals' as ConditionOperator,
        value: 'high',
      },
      {
        field: 'assignedTo',
        operator: 'equals' as ConditionOperator,
        value: null,
      },
    ],
    actions: [
      {
        type: 'assign' as ActionType,
        parameters: { engineer: 'senior_engineer' },
      },
    ],
  },

  AUTO_CLOSE_DUPLICATES: {
    name: 'Auto-close obvious duplicate tickets',
    trigger: 'ticket_created' as TriggerType,
    conditions: [
      {
        field: 'isDuplicate',
        operator: 'equals' as ConditionOperator,
        value: true,
      },
    ],
    actions: [
      {
        type: 'set_status' as ActionType,
        parameters: { status: 'closed' },
      },
      {
        type: 'send_email' as ActionType,
        parameters: {
          email: '${reporter.email}',
          template: 'duplicate_notice',
        },
      },
    ],
  },

  INACTIVITY_ESCALATION: {
    name: 'Escalate inactive tickets after 24 hours',
    trigger: 'ticket_assigned' as TriggerType,
    conditions: [
      {
        field: 'inactiveHours',
        operator: 'greater_than' as ConditionOperator,
        value: 24,
      },
    ],
    actions: [
      {
        type: 'notify_team' as ActionType,
        parameters: { team: 'managers' },
      },
    ],
  },
};

export const automationEngine = new AutomationEngine();
