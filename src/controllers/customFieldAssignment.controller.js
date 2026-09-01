const CustomFieldAssignment = require(
  "../models/customFieldAssignment.model"
);

/*
 * Remove empty values, trim spaces
 * and prevent duplicate options.
 */
const cleanOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return [
    ...new Set(
      options
        .map((option) => String(option).trim())
        .filter(Boolean)
    )
  ];
};


// ========================================
// CREATE ASSIGNMENT
// ========================================

exports.assignFields = async (req, res) => {
  try {
    const {
      customFieldIds,
      categoryId,
      subcategoryId,
      type,

      /*
       * Used when assigning only one field.
       */
      options = [],

      /*
       * Used when assigning multiple fields.
       *
       * Example:
       * {
       *   "fieldId1": ["Tata", "Hyundai"],
       *   "fieldId2": ["Option 1", "Option 2"]
       * }
       */
      optionsByField = {}
    } = req.body;

    if (
      !customFieldIds ||
      !Array.isArray(customFieldIds) ||
      customFieldIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Select custom fields"
      });
    }

    if (!categoryId || !subcategoryId || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Category, subcategory and type are required"
      });
    }

    const assignments = customFieldIds.map(
      (fieldId) => {
        /*
         * If optionsByField contains options for this
         * field, use them.
         *
         * Otherwise, when only one field is selected,
         * use the normal options array.
         */
        const fieldOptions =
          optionsByField[fieldId] ||
          (
            customFieldIds.length === 1
              ? options
              : []
          );

        return {
          customFieldId: fieldId,
          categoryId,
          subcategoryId,
          type,
          options: cleanOptions(fieldOptions)
        };
      }
    );

    const createdAssignments =
      await CustomFieldAssignment.insertMany(
        assignments
      );

    res.status(201).json({
      success: true,
      message:
        "Custom fields assigned successfully",
      data: createdAssignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// GET ASSIGNED FIELDS
// ========================================

exports.getAssignedFields = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      type
    } = req.query;

    if (!categoryId || !subcategoryId || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Category, subcategory and type are required"
      });
    }

    const assignments =
      await CustomFieldAssignment.find({
        categoryId,
        subcategoryId,
        type
      })
        .populate("customFieldId")
        .sort({
          sortOrder: 1,
          createdAt: 1
        })
        .lean();

    /*
     * Keep the existing assignment structure,
     * but replace the custom field options with
     * the assignment-specific options.
     */
    const fields = assignments.map(
      (assignment) => {
        if (!assignment.customFieldId) {
          return assignment;
        }

        const assignmentOptions =
          Array.isArray(assignment.options) &&
          assignment.options.length > 0
            ? assignment.options
            : (
                assignment.customFieldId.options ||
                []
              );

        return {
          ...assignment,

          customFieldId: {
            ...assignment.customFieldId,

            /*
             * These are now the correct options
             * for the selected subcategory.
             */
            options: assignmentOptions,

            /*
             * Assignment requirement overrides
             * the original custom field value.
             */
            isRequired:
              assignment.isRequired ||
              assignment.customFieldId.isRequired
          }
        };
      }
    );

    res.json({
      success: true,
      data: fields
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// REMOVE ASSIGNMENT
// ========================================

exports.removeAssignment = async (req, res) => {
  try {
    const deleted =
      await CustomFieldAssignment.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.json({
      success: true,
      message: "Assignment removed"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// GET ALL ASSIGNMENTS FOR ADMIN
// ========================================

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments =
      await CustomFieldAssignment.find()
        .populate("customFieldId")
        .populate("categoryId")
        .populate("subcategoryId")
        .sort({
          createdAt: -1
        });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// UPDATE ASSIGNMENT
// ========================================

exports.updateAssignment = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      type,
      isRequired,
      sortOrder,
      options
    } = req.body;

    /*
     * Only allow these properties to be updated.
     */
    const updateData = {};

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }

    if (subcategoryId !== undefined) {
      updateData.subcategoryId = subcategoryId;
    }

    if (type !== undefined) {
      updateData.type = type;
    }

    if (isRequired !== undefined) {
      updateData.isRequired = isRequired;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    if (options !== undefined) {
      updateData.options = cleanOptions(options);
    }

    const updated =
      await CustomFieldAssignment.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true
        }
      )
        .populate("customFieldId")
        .populate("categoryId")
        .populate("subcategoryId");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.json({
      success: true,
      message: "Assignment updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};